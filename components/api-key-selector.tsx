'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyIcon, CheckIcon, XIcon } from '@/components/icons';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useApiKey } from '@/hooks/use-api-key';
import { toast } from './toast';
import { ApiKeyTester } from './api-key-tester';

interface ApiKeySelectorProps {
  className?: string;
}

export function ApiKeySelector({ className }: ApiKeySelectorProps) {
  const { apiKey, updateApiKey, hasCustomApiKey } = useApiKey();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    // Ensure input is trimmed and not empty
    const trimmedValue = inputValue?.trim() || '';

    if (trimmedValue) {
      // Basic validation for Google API keys which typically start with "AIza"
      if (trimmedValue.startsWith('AIza')) {
        // Test the API key before saving it
        setIsTesting(true);
        try {
          const response = await fetch('/api/test-api-key', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${trimmedValue}`,
            },
          });

          const result = await response.json();

          if (response.ok) {
            // Key is valid, save it
            updateApiKey(trimmedValue);
            toast({
              type: 'success',
              description:
                'Custom API key has been verified and saved. Reloading page...',
            });

            // Reload page to apply the new API key after a short delay
            setTimeout(() => {
              window.location.reload();
            }, 1000);

            setIsEditing(false);
          } else {
            // Key format is correct but doesn't work with the API            console.log('API Key Error Details:', result);
            toast({
              type: 'error',
              description: `${result.error || 'API key validation failed'}: ${result.details || 'The API key format is correct, but the key was rejected by the Google API.'}`,
            });
            // Stay in editing mode
          }
        } catch (error) {
          console.error('Error validating API key:', error);
          toast({
            type: 'error',
            description: 'Error validating API key',
          });
        } finally {
          setIsTesting(false);
        }
      } else {
        toast({
          type: 'error',
          description:
            'Invalid API key format. Google API keys typically start with "AIza"',
        });
        // Don't close editing mode on validation error
      }
    } else {
      updateApiKey('');
      toast({
        type: 'success',
        description: 'Using default API key, reloading page...',
      });

      // Reload page to apply default API key
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setInputValue('');
    setIsEditing(false);
  };
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = () => {
    setShowConfirm(true);
  };

  const confirmClear = () => {
    updateApiKey('');
    toast({
      type: 'success',
      description: 'Custom API key has been removed, reloading page...',
    });
    setShowConfirm(false);

    // Reload page to apply the default API key
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const cancelClear = () => {
    setShowConfirm(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  if (isEditing) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Input
          type="password"
          placeholder="Enter API Key"
          value={inputValue}
          onChange={(e) => {
            const value = e.target.value;
            setInputValue(value);
            // Basic validation as user types
            setIsValid(
              !value || value.trim() === '' || value.startsWith('AIza'),
            );
          }}
          onKeyDown={handleKeyDown}
          className={`h-8 w-40 text-xs ${!isValid ? 'border-red-500' : ''}`}
          disabled={isTesting}
          autoFocus
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="h-8 w-8"
              disabled={!isValid || isTesting}
            >
              {isTesting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isTesting ? 'Testing API key...' : 'Save and apply API key'}
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8"
          disabled={isTesting}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  return (
    <>
      <div className={`flex items-center ${className} gap-2`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={hasCustomApiKey ? 'default' : 'outline'}
              size="sm"
              className="gap-2 h-8"
              onClick={() => {
                setInputValue(apiKey);
                setIsEditing(true);
              }}
            >
              <KeyIcon className="h-3.5 w-3.5" />
              {hasCustomApiKey ? 'Custom API Key' : 'Add API Key'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {hasCustomApiKey
              ? "You're using a custom API key"
              : 'Add your own API key for model access'}
          </TooltipContent>
        </Tooltip>
        {hasCustomApiKey && (
          <>
            <ApiKeyTester />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="h-8 w-8"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove custom API key</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {/* Confirmation dialog for removing API key */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your custom API key and revert to using the
              default key. The page will reload to apply this change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelClear}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClear}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
