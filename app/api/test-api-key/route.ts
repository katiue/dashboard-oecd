import { NextResponse } from 'next/server';
import { createProvider } from '@/lib/ai/providers';

export async function POST(request: Request) {
  try {
    // Extract the API key from the Authorization header
    const authHeader = request.headers.get('Authorization');
    let apiKey: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7).trim();
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key provided' },
        { status: 400 },
      );
    }

    console.log(`Testing API key: ${apiKey.substring(0, 5)}...`);

    // Test the API key by creating a provider and making a simple request
    try {
      const provider = createProvider(apiKey);
      const model = provider.languageModel('chat-model');

      // Make a simple request to test the API key
      const result = await model.doGenerate({
        inputFormat: 'messages',
        mode: { type: 'regular' },
        prompt: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Say "API key is working!" if you can read this',
              },
            ],
          },
        ],
        maxTokens: 10,
      });

      // If we get here, the API key is working
      return NextResponse.json({ success: true, message: result.text });
    } catch (error: any) {
      console.error('API key validation error:', error);
      return NextResponse.json(
        {
          error: 'Invalid API key',
          details: error.message,
        },
        { status: 401 },
      );
    }
  } catch (error: any) {
    console.error('Test API key error:', error);
    return NextResponse.json(
      {
        error: 'Failed to test API key',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
