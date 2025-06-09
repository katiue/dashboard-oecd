import {
  appendClientMessage,
  appendResponseMessages,
  createDataStream,
  smoothStream,
  streamText,
} from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import { type RequestHints, systemPrompt } from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  getStreamIdsByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID, getTrailingMessageId } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { filterCsvData } from '@/lib/ai/tools/filter-csv-data';
import { readCsvFile } from '@/lib/ai/tools/read-csv-file';
import { createInlineChart } from '@/lib/ai/tools/create-inline-chart';
import { captureChartScreenshot } from '@/lib/ai/tools/capture-chart-screenshot';
import { 
  loadData, 
  cleanData, 
  filterData, 
  aggregateData, 
  transformData, 
  analyzeStats, 
  exportProcessedData,
  calculateStatistics,
  groupAndAggregate,
  sortData,
  sumEntireColumn,
  detectAndResolveDuplicates,
  cleanDataForDashboard,
  resolveDuplicatesForDashboard,
  processDataForDashboard,
  loadOECDPatentData,
  cleanOECDPatentData,
  preparePatentDataForVisualization
} from '@/lib/ai/tools/tabular-data-tools';
import { createDashboardChart } from '@/lib/ai/tools/create-dashboard-chart';


import { isProductionEnvironment } from '@/lib/constants';
import { myProvider, createProvider } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import type { Chat } from '@/lib/db/schema';
import { differenceInSeconds } from 'date-fns';
import { ChatSDKError } from '@/lib/errors';
import { 
  extractCsvFiles, 
  transformMessagesForAgent, 
  generateCsvSystemPrompt 
} from '@/lib/ai/csv-transform';


export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(
          ' > Resumable streams are disabled due to missing REDIS_URL',
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }
  try {
    const { id, message, selectedChatModel, selectedVisibilityType } =
      requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const userType: UserType = session.user.type;

    let messageCount = 0;
    try {
      messageCount = await getMessageCountByUserId({
        id: session.user.id,
        differenceInHours: 24,
      });
    } catch (error) {
      console.error('Failed to get message count:', error);
      // For guest users, we'll allow them to continue with a default count of 0
      // For other user types, we should enforce the limits more strictly
      if (userType !== 'guest') {
        return new ChatSDKError(
          'bad_request:database',
          'Unable to verify message quota. Please try again later.',
        ).toResponse();
      }
    }

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError('rate_limit:chat').toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      try {
        const title = await generateTitleFromUserMessage({
          message,
        });

        await saveChat({
          id,
          userId: session.user.id,
          title,
          visibility: selectedVisibilityType,
        });
      } catch (error) {
        console.error('Failed to create new chat:', error);
        return new ChatSDKError(
          'bad_request:database',
          'Failed to save chat',
        ).toResponse();
      }
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }    const previousMessages = await getMessagesByChatId({ id });

    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message,
    });    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    try {
      await saveMessages({
        messages: [
          {
            chatId: id,
            id: message.id,
            role: 'user',
            parts: message.parts,
            attachments: message.experimental_attachments ?? [],
            createdAt: new Date(),
          },
        ],
      });
    } catch (error) {
      console.error('Failed to save user message:', error);
      return new ChatSDKError(
        'bad_request:database',
        'Failed to save message',
      ).toResponse();
    }

    const streamId = generateUUID();
    try {
      await createStreamId({ streamId, chatId: id });
    } catch (error) {
      console.error('Failed to create stream ID:', error);
      return new ChatSDKError(
        'bad_request:database',
        'Failed to create stream',
      ).toResponse();
    } // Check for authorization header that might contain an API key
    const authHeader = request.headers.get('Authorization');
    let customApiKey: string | undefined;

    // If there's an Auth header in the format "Bearer API_KEY", extract the key
    if (authHeader?.startsWith('Bearer ')) {
      customApiKey = authHeader.substring(7);
    }    // Create provider with custom API key if available
    const provider = customApiKey ? createProvider(customApiKey) : myProvider;

    const stream = createDataStream({
      execute: (dataStream) => {
        console.log('🌊 DataStream created, executing main handler...');
        
        // Extract CSV files from the entire conversation
        const conversationCsvFiles = extractCsvFiles(messages, previousMessages, message);
        console.log('📁 CSV files extracted:', conversationCsvFiles.length);

        // Transform messages to remove CSV attachments and add file references
        const transformedMessages = transformMessagesForAgent(messages, conversationCsvFiles);
        console.log('🔄 Messages transformed for agent processing');

        // Generate system prompt with CSV-specific instructions if needed
        const systemPromptContent = systemPrompt({ selectedChatModel, requestHints }) + 
          generateCsvSystemPrompt(conversationCsvFiles);
        console.log('📝 System prompt generated with CSV instructions');

        console.log('🔧 About to call streamText...');
        console.log('🔍 Messages count:', transformedMessages.length);
        console.log('🔍 System prompt length:', systemPromptContent.length);
        console.log('🔍 Provider type:', provider.constructor.name);
        console.log('🔍 Selected model:', selectedChatModel);
        console.log('🔍 CSV files detected:', conversationCsvFiles.length);
        console.log('🔍 Last message content preview:', `${transformedMessages[transformedMessages.length - 1]?.content?.slice(0, 200)}...`);
        console.log('🔍 System prompt preview:', `${systemPromptContent.slice(0, 300)}...`);
        
        const result = streamText({
          model: provider.languageModel(selectedChatModel),
          system: systemPromptContent,
          messages: transformedMessages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                  'filterCsvData',
                  'readCsvFile',
                  'createDashboardChart',
                  'createInlineChart',
                  'loadData',
                  'cleanData',
                  'filterData',
                  'aggregateData',
                  'transformData',
                  'analyzeStats',
                  'exportProcessedData',
                  'captureChartScreenshot',
                  'calculateStatistics',
                  'groupAndAggregate',
                  'sortData',
                  'sumEntireColumn',
                  'detectAndResolveDuplicates',
                  'cleanDataForDashboard',
                  'resolveDuplicatesForDashboard',
                  'processDataForDashboard',
                  'loadOECDPatentData',
                  'cleanOECDPatentData',
                  'preparePatentDataForVisualization',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,            }),
            filterCsvData,
            readCsvFile,
            createInlineChart,
            createDashboardChart: createDashboardChart({ dataStream }),
            loadData,
            cleanData,
            filterData,
            aggregateData,
            transformData,
            analyzeStats,
            exportProcessedData,
            captureChartScreenshot,
            calculateStatistics,
            groupAndAggregate,
            sortData,
            sumEntireColumn,
            detectAndResolveDuplicates,
            cleanDataForDashboard: cleanDataForDashboard({ dataStream }),
            resolveDuplicatesForDashboard: resolveDuplicatesForDashboard({ dataStream }),
            processDataForDashboard: processDataForDashboard({ dataStream }),
            loadOECDPatentData,
            cleanOECDPatentData,
            preparePatentDataForVisualization,
          },
          onStepFinish: ({ stepType, text, toolCalls, toolResults, usage, warnings }) => {
            console.log('🔧 AI Step finished:', {
              stepType,
              textLength: text?.length || 0,
              toolCallsCount: toolCalls?.length || 0,
              toolResultsCount: toolResults?.length || 0,
              usage,
              warnings
            });
            
            if (toolCalls && toolCalls.length > 0) {
              console.log('🛠️ Tool calls in this step:', toolCalls.map(tc => ({
                toolName: tc.toolName,
                toolCallId: tc.toolCallId,
                argsKeys: Object.keys(tc.args || {})
              })));
            }
            
            if (toolResults && toolResults.length > 0) {
              console.log('🔧 Tool results in this step:', toolResults.map(tr => ({
                toolCallId: tr.toolCallId,
                resultType: typeof tr.result,
                resultPreview: typeof tr.result === 'string' ? `${tr.result.slice(0, 100)}...` : `${JSON.stringify(tr.result).slice(0, 100)}...`
              })));
            }
          },
          onFinish: async ({ response, finishReason, usage, warnings, experimental_providerMetadata }) => {
            console.log('🎯 onFinish callback triggered!');
            console.log('🎯 Response messages count:', response?.messages?.length || 0);
            console.log('🎯 Finish reason:', finishReason);
            console.log('🎯 Usage stats:', usage);
            console.log('🎯 Warnings:', warnings);
            console.log('🎯 Provider metadata:', experimental_providerMetadata);
            console.log('🎯 Response messages detail:', response?.messages?.map(msg => ({
              role: msg.role,
              contentType: typeof msg.content,
              contentLength: typeof msg.content === 'string' ? msg.content.length : 'N/A',
              messageId: msg.id,
              hasExperimentalAttachments: !!(msg as any).experimental_attachments,
              messageKeys: Object.keys(msg)
            })));
            
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [message],
                  responseMessages: response.messages,
                });

                console.log('💾 Saving assistant message to database...');
                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
                console.log('✅ Assistant message saved successfully');
              } catch (error) {
                console.error('❌ Failed to save chat response:', error);
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        console.log('✅ streamText call completed, starting stream processing...');
        
        // Add detailed logging for stream events
        const originalConsumeStream = result.consumeStream.bind(result);
        result.consumeStream = () => {
          console.log('📡 Starting to consume AI stream...');
          return originalConsumeStream();
        };

        result.consumeStream();

        console.log('🔗 Merging AI stream into data stream...');
        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: (error) => {
        console.error('🚨 DataStream error occurred:', error);
        return 'Oops, an error occurred!';
      },
    });

    console.log('🌊 DataStream created successfully');

    const streamContext = getStreamContext();

    if (streamContext) {
      console.log('🔄 Using resumable stream context with streamId:', streamId);
      return new Response(
        await streamContext.resumableStream(streamId, () => stream),
      );
    } else {
      console.log('📡 Using direct stream response');
      return new Response(stream);
    }
  } catch (error) {
    console.error('Chat API error:', error);
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    // Handle any other errors
    return new ChatSDKError(
      'bad_request:database',
      'An unexpected error occurred',
    ).toResponse();
  }
}

export async function GET(request: Request) {
  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  let chat: Chat;

  try {
    chat = await getChatById({ id: chatId });
  } catch {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (!chat) {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (chat.visibility === 'private' && chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const streamIds = await getStreamIdsByChatId({ chatId });

  if (!streamIds.length) {
    return new ChatSDKError('not_found:stream').toResponse();
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new ChatSDKError('not_found:stream').toResponse();
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  const stream = await streamContext.resumableStream(
    recentStreamId,
    () => emptyDataStream,
  );

  /*
   * For when the generation is streaming during SSR
   * but the resumable stream has concluded at this point.
   */
  if (!stream) {
    const messages = await getMessagesByChatId({ id: chatId });
    const mostRecentMessage = messages.at(-1);

    if (!mostRecentMessage) {
      return new Response(emptyDataStream, { status: 200 });
    }

    if (mostRecentMessage.role !== 'assistant') {
      return new Response(emptyDataStream, { status: 200 });
    }

    const messageCreatedAt = new Date(mostRecentMessage.createdAt);

    if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
      return new Response(emptyDataStream, { status: 200 });
    }

    const restoredStream = createDataStream({
      execute: (buffer) => {
        buffer.writeData({
          type: 'append-message',
          message: JSON.stringify(mostRecentMessage),
        });
      },
    });

    return new Response(restoredStream, { status: 200 });
  }

  return new Response(stream, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });

  if (chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
