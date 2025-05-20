# Custom API Key Feature

## Overview

The custom API key feature allows users to input their own Google Gemini API key for model access instead of using the default key from the application's environment variables. This provides several benefits:

1. **Usage Quotas**: Users can leverage their own API quotas when the shared key reaches limits
2. **Billing Control**: Users can track and manage their own API usage and billing
3. **Privacy**: Sensitive conversations use the user's own API key
4. **Reliability**: Reduces dependency on the application's default key availability

## How It Works

### User Interface

The API key selector is available in the chat header next to the visibility selector. Users can:

- Add their own API key
- Test if the key is valid and working
- Remove the custom key and revert to the default one

### Technical Implementation

1. **Storage**: The API key is stored in the browser's localStorage for persistence
2. **Validation**: Keys are validated both client-side (format checking) and server-side (API test)
3. **Usage**: When a custom key is provided, it's used for:
   - Chat model access
   - Title generation
   - Other AI functions within the application

### Security Considerations

- API keys are stored only in the user's browser (localStorage)
- Keys are never stored on the server
- Keys are sent securely over HTTPS
- Input fields mask the key to prevent shoulder surfing

## Getting a Google Gemini API Key

1. Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create or sign in to your Google account
3. Get an API key from the API Keys section
4. Copy the key and paste it into the API Key input field in the application

## Troubleshooting

If you encounter issues with your API key:

1. **Key Format**: Ensure your key starts with "AIza"
2. **API Quotas**: Check if you've reached your Google API usage limits
3. **Browser Storage**: Try clearing browser cache if settings aren't persisting
4. **Multiple Tabs**: Changes to API key settings will affect all open tabs

## Developer Notes

The API key feature is implemented across several components:

- `api-key-selector.tsx`: Main UI component for key management
- `api-key-tester.tsx`: Component for validating keys
- `use-api-key.ts`: Hook for API key state management
- `providers.ts`: Logic for using custom keys with model providers
- `test-api-key/route.ts`: API endpoint for key validation
