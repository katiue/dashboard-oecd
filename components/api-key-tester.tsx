'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApiKey } from '@/hooks/use-api-key';
import { toast } from './toast';

export function ApiKeyTester() {
  const { apiKey } = useApiKey();
  const [isLoading, setIsLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    'valid' | 'invalid' | 'untested'
  >('untested');

  const testApiKey = async () => {
    if (!apiKey) {
      toast({
        type: 'error',
        description: 'No custom API key is set',
      });
      return;
    }

    setIsLoading(true);
    setValidationStatus('untested');

    try {
      // Make a basic request to the API to test the key
      const response = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setValidationStatus('valid');
        toast({
          type: 'success',
          description: 'API key is valid and working!',
        });
      } else {
        setValidationStatus('invalid');
        toast({
          type: 'error',
          description: `${result.error || 'API key test failed'}: ${result.details || 'No additional details available'}`,
        });
      }
    } catch (error) {
      console.error('API key test error:', error);
      setValidationStatus('invalid');
      toast({
        type: 'error',
        description: 'Error testing API key',
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Get status color based on validation result
  const getStatusStyles = () => {
    if (validationStatus === 'valid')
      return 'border-green-500 hover:border-green-600';
    if (validationStatus === 'invalid')
      return 'border-red-500 hover:border-red-600';
    return '';
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={testApiKey}
      disabled={isLoading || !apiKey}
      className={`text-xs ${getStatusStyles()}`}
    >
      {isLoading ? 'Testing...' : 'Test API Key'}
    </Button>
  );
}
