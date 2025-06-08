'use client';

import type { UIMessage } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import type { Vote } from '@/lib/db/schema';
import { DocumentToolCall, DocumentToolResult } from './document';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import { InlineChart } from './inline-chart';
import equal from 'fast-deep-equal';
import { cn, sanitizeText } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from './document-preview';
import { MessageReasoning } from './message-reasoning';
import type { UseChatHelpers } from '@ai-sdk/react';

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  requiresScrollPadding,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div
            className={cn('flex flex-col gap-4 w-full', {
              'min-h-96': message.role === 'assistant' && requiresScrollPadding,
            })}
          >
            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <div
                  data-testid={`message-attachments`}
                  className="flex flex-row justify-end gap-2"
                >
                  {message.experimental_attachments.map((attachment) => (
                    <PreviewAttachment
                      key={attachment.url}
                      attachment={attachment}
                    />
                  ))}
                </div>
              )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === 'reasoning') {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.reasoning}
                  />
                );
              }

              if (type === 'text') {
                if (mode === 'view') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {message.role === 'user' && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode('edit');
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn('flex flex-col gap-4', {
                          'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                            message.role === 'user',
                        })}
                      >
                        <Markdown>{sanitizeText(part.text)}</Markdown>
                      </div>
                    </div>
                  );
                }

                if (mode === 'edit') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-invocation') {
                const { toolInvocation } = part;
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === 'call') {
                  const { args } = toolInvocation;

                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ['getWeather'].includes(toolName),
                      })}
                    >
                      {toolName === 'getWeather' ? (
                        <Weather />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolCall
                          type="update"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolCall
                          type="request-suggestions"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'analyzeCsvData' ? (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              Analyzing CSV data...
                            </span>
                          </div>
                          <pre className="text-xs text-muted-foreground overflow-auto">
                            {JSON.stringify(args, null, 2)}
                          </pre>
                        </div>
                      ) : toolName === 'configureChart' ? (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              {args.csvFileUrl ? 'Creating and configuring chart...' : 'Configuring chart...'}
                            </span>
                          </div>
                          <pre className="text-xs text-muted-foreground overflow-auto">
                            {JSON.stringify(args, null, 2)}
                          </pre>
                        </div>
                      ) : toolName === 'filterCsvData' ? (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              Filtering data...
                            </span>
                          </div>
                          <pre className="text-xs text-muted-foreground overflow-auto">
                            {JSON.stringify(args, null, 2)}
                          </pre>
                        </div>
                      ) : toolName === 'createChart' ? (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              Creating chart...
                            </span>
                          </div>
                          <pre className="text-xs text-muted-foreground overflow-auto">
                            {JSON.stringify(args, null, 2)}
                          </pre>
                        </div>
                      ) : toolName === 'readCsvFile' ? (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              Reading CSV file...
                            </span>
                          </div>
                          <pre className="text-xs text-muted-foreground overflow-auto">
                            {JSON.stringify(args, null, 2)}
                          </pre>
                        </div>
                      ) : toolName === 'createChartDocument' ? (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              Creating chart document...
                            </span>
                          </div>
                          <pre className="text-xs text-muted-foreground overflow-auto">
                            {JSON.stringify(args, null, 2)}
                          </pre>
                        </div>
                      ) : toolName === 'createInlineChart' ? (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              Creating chart visualization...
                            </span>
                          </div>
                          <pre className="text-xs text-muted-foreground overflow-auto">
                            {JSON.stringify(args, null, 2)}
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  );
                }

                if (state === 'result') {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === 'getWeather' ? (
                        <Weather weatherAtLocation={result} />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview
                          isReadonly={isReadonly}
                          result={result}
                        />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolResult
                          type="update"
                          result={result}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolResult
                          type="request-suggestions"
                          result={result}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'analyzeCsvData' ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">
                                CSV Analysis Results
                              </span>
                            </div>
                            {result.error ? (
                              <div className="text-red-500 text-sm">
                                {result.error}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <strong>Columns:</strong>{' '}
                                  {result.totalColumns} | <strong>Rows:</strong>{' '}
                                  {result.rowCount}
                                </div>
                                {result.chartSuggestions &&
                                  result.chartSuggestions.length > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                      Generated {result.chartSuggestions.length}{' '}
                                      chart visualization(s)
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>

                          {/* Render inline charts if available */}
                          {result.chartSuggestions?.map((chart: any) => (
                            <InlineChart
                              key={`chart-${chart.title}-${chart.chartType}`}
                              chartType={chart.chartType}
                              title={chart.title}
                              description=""
                              data={chart.data}
                              metadata={chart.metadata}
                              config={chart.config}
                            />
                          ))}
                        </div>
                      ) : toolName === 'configureChart' ? (
                        <div className="space-y-4">
                          {result.error ? (
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="text-red-500 text-sm">
                                Error: {result.error}
                              </div>
                            </div>
                          ) : result.chart ? (
                            // Display the created chart if available
                            <>
                              <InlineChart
                                chartType={result.chart.chartType}
                                title={result.chart.title}
                                description={result.chart.description}
                                data={result.chart.data}
                                metadata={result.chart.metadata}
                                config={result.chart.config}
                              />
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-green-800">
                                    Chart Created Successfully
                                  </span>
                                </div>
                                {result.message && (
                                  <div className="text-xs text-green-700">
                                    {result.message}
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            // Display configuration results without chart
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium">
                                  Chart Configuration Results
                                </span>
                              </div>
                              <div className="text-sm">
                                <div className="font-medium mb-2">
                                  Chart: {result.chartConfig?.title || 'Untitled Chart'}
                                </div>
                                <div className="text-muted-foreground">
                                  Type: {result.chartConfig?.chartType || 'Unknown'} | 
                                  Columns: {result.chartConfig?.dataMapping ? Object.values(result.chartConfig.dataMapping).flat().join(', ') : 'N/A'}
                                </div>
                                {result.message && (
                                  <div className="text-xs text-muted-foreground mt-2">
                                    {result.message}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : toolName === 'createInlineChart' ? (
                        <div className="space-y-4">
                          {result.error ? (
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="text-red-500 text-sm">
                                {result.error}
                              </div>
                            </div>
                          ) : result.chart ? (
                            <InlineChart
                              chartType={result.chart.type}
                              title={result.chart.title}
                              description={result.chart.description}
                              data={result.chart.data}
                              metadata={result.chart.metadata}
                              config={result.chart.config}
                            />
                          ) : null}
                        </div>
                      ) : toolName === 'filterCsvData' ? (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              Filtered Data Results
                            </span>
                          </div>
                          {result.error ? (
                            <div className="text-red-500 text-sm">
                              {result.error}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-sm">
                                Found {result.matchCount} matches, showing{' '}
                                {result.returnedCount} rows
                              </div>
                              <pre className="text-xs overflow-auto max-h-64">
                                {JSON.stringify(result.filteredData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : toolName === 'createChart' ? (
                        <div className="space-y-4">
                          {result.error ? (
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="text-red-500 text-sm">
                                {result.error}
                              </div>
                            </div>
                          ) : result.chart ? (
                            <InlineChart
                              chartType={result.chart.type}
                              title={result.chart.title}
                              description={result.chart.description}
                              data={result.chart.data}
                              metadata={result.chart.metadata}
                              config={result.chart.config}
                            />
                          ) : null}
                        </div>
                      ) : toolName === 'readCsvFile' ? (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              CSV File Read
                            </span>
                          </div>
                          {result.error ? (
                            <div className="text-red-500 text-sm">
                              {result.error}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-sm">
                                File size: {result.size} characters
                              </div>
                              <pre className="text-xs overflow-auto max-h-32">
                                {result.content?.substring(0, 500)}...
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : toolName === 'createDashboard' ? (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              Dashboard Created
                            </span>
                          </div>
                          {result.error ? (
                            <div className="text-red-500 text-sm">
                              {result.error}
                            </div>
                          ) : result.dashboard ? (
                            <div className="space-y-2">
                              <div className="text-sm">
                                ✅ Dashboard created with {result.dashboard.charts?.length || 6} charts
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Charts: {result.dashboard.charts?.map((chart: any) => chart.type).join(', ') || 'bar, line, pie, scatter, radar, heatmap'}
                              </div>
                              {result.message && (
                                <div className="text-xs text-green-700 mt-2">
                                  {result.message}
                                </div>
                              )}
                              {result.summary && (
                                <div className="text-xs text-muted-foreground">
                                  Data: {result.summary.dataRows} rows, {result.summary.dataColumns} columns
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Dashboard creation in progress...
                            </div>
                          )}
                        </div>
                      ) : toolName === 'updateDashboard' ? (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              Dashboard Updated
                            </span>
                          </div>
                          {result.error ? (
                            <div className="text-red-500 text-sm">
                              {result.error}
                            </div>
                          ) : result.dashboard ? (
                            <div className="space-y-2">
                              <div className="text-sm">
                                ✅ Dashboard updated successfully
                              </div>
                              {result.updateSummary && (
                                <div className="text-xs text-muted-foreground">
                                  Update type: {result.updateSummary.updateType} | 
                                  Charts modified: {result.updateSummary.chartsModified}
                                  {result.updateSummary.newDataSource && ' | New data source'}
                                  {result.updateSummary.colorSchemeChanged && ' | Color scheme changed'}
                                </div>
                              )}
                              {result.message && (
                                <div className="text-xs text-green-700 mt-2">
                                  {result.message}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Dashboard update in progress...
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              Tool Result: {toolName}
                            </span>
                          </div>
                          <pre className="text-xs text-muted-foreground overflow-auto max-h-64">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                }
              }
            })}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
