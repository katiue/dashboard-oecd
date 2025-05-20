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
  // Use the provided API key or let the library use the environment variable
  if (customApiKey) {
    console.log(
      `Creating Google provider with custom API key: ${customApiKey.substring(0, 5)}...`,
    );
  } else {
    // Check if the env var is actually set
    // Using NEXT_PUBLIC_ prefix for client-side env vars
    const envKey = process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
    if (envKey) {
      console.log(
        `Creating Google provider with env API key: ${envKey.substring(0, 5)}...`,
      );
    } else {
      console.warn('WARNING: No API key found in environment variables');
    }
  }

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
