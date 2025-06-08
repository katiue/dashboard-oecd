'use client';

import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import {
  createGoogleGenerativeAI,
  type GoogleGenerativeAIProvider,
} from '@ai-sdk/google';

// Function to create provider with optional custom API key - Client version
export function createProvider(customApiKey?: string) {
  let google: GoogleGenerativeAIProvider;
  try {
    google = createGoogleGenerativeAI(
      customApiKey ? { apiKey: customApiKey } : undefined,
    );
  } catch (error) {
    console.error('Error creating Google provider:', error);
    throw error;
  }

  return customProvider({
    languageModels: {
      'chat-model': google('gemini-2.0-flash'),
      'chat-model-reasoning': wrapLanguageModel({
        model: google('gemini-2.0-flash'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': google('gemini-2.0-flash'),
      'artifact-model': google('gemini-2.0-flash'),
    },
  });
}

// Default provider using environment variables
export const myProvider = createProvider();
