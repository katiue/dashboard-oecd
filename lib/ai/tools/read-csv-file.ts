import { tool } from 'ai';
import { z } from 'zod';

export const readCsvFile = tool({
  description: 'Read a CSV file from a URL (e.g., uploaded file) and return its content as text',
  parameters: z.object({
    fileUrl: z.string().url().describe('The URL of the CSV file to read'),
  }),
  execute: async ({ fileUrl }) => {
    try {
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        return {
          error: `Failed to fetch file: ${response.status} ${response.statusText}`,
          content: '',
        };
      }

      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('text/csv') && !contentType.includes('text/plain') && !contentType.includes('application/vnd.ms-excel')) {
        return {
          error: 'File does not appear to be a CSV file',
          content: '',
        };
      }

      const content = await response.text();
      
      if (!content || content.trim() === '') {
        return {
          error: 'File is empty or could not be read',
          content: '',
        };
      }

      return {
        content,
        size: content.length,
        message: `Successfully read CSV file (${content.length} characters)`,
      };

    } catch (error) {
      return {
        error: `Failed to read CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        content: '',
      };
    }
  },
}); 