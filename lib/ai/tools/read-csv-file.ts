import { tool } from 'ai';
import { z } from 'zod';

// Simple CSV parser function
function parseCSV(csvText: string): {
  headers: string[];
  data: Record<string, string>[];
} {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return { headers: [], data: [] };

  const headers = lines[0].split(',').map((h) => h.trim().replace(/['"]/g, ''));

  // Validate headers
  if (headers.length === 0 || headers.some((h) => h === '')) {
    throw new Error('Invalid CSV headers found');
  }

  const data = lines
    .slice(1)
    .filter((line) => line.trim() !== '') // Skip empty lines
    .map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/['"]/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

  return { headers, data };
}

// Function to get random sample of data
function getRandomSample<T>(array: T[], count: number): T[] {
  if (array.length <= count) return array;

  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

export const readCsvFile = tool({
  description:
    'Read a CSV file from a URL (e.g., uploaded file), parse it, and return 10 random data rows along with column information. Only use this tool when a user has explicitly provided a CSV file URL or uploaded a CSV file.',
  parameters: z.object({
    fileUrl: z.string().describe('The URL of the CSV file to read'),
  }),
  execute: async ({ fileUrl }) => {
    console.log('readCsvFile tool called with URL:', fileUrl);
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(fileUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'text/csv, text/plain, application/vnd.ms-excel, */*',
        },
      });
      clearTimeout(timeoutId);
      console.log('CSV fetch completed, status:', response.status);

      if (!response.ok) {
        console.log('CSV fetch failed with status:', response.status);
        return {
          error: `Failed to fetch file: ${response.status} ${response.statusText}`,
          content: '',
          columns: [],
          sampleData: [],
          totalRows: 0,
        };
      }

      const contentType = response.headers.get('content-type');
      if (
        contentType &&
        !contentType.includes('text/csv') &&
        !contentType.includes('text/plain') &&
        !contentType.includes('application/vnd.ms-excel')
      ) {
        return {
          error: 'File does not appear to be a CSV file',
          content: '',
          columns: [],
          sampleData: [],
          totalRows: 0,
        };
      }
      const content = await response.text();

      // Check file size limit (1MB)
      if (content.length > 1024 * 1024) {
        return {
          error: 'File is too large. Maximum size is 1MB.',
          content: '',
          columns: [],
          sampleData: [],
          totalRows: 0,
        };
      }

      if (!content || content.trim() === '') {
        return {
          error: 'File is empty or could not be read',
          content: '',
          columns: [],
          sampleData: [],
          totalRows: 0,
        };
      }

      // Parse the CSV data
      const { headers, data } = parseCSV(content);

      if (data.length === 0) {
        return {
          error: 'No valid data rows found in CSV',
          content,
          columns: headers,
          sampleData: [],
          totalRows: 0,
        };
      }

      // Get column information
      const columns = headers.map((header) => {
        // Analyze data type by looking at the first few non-empty values
        const sampleValues = data
          .slice(0, 10)
          .map((row) => row[header])
          .filter((val) => val !== null && val !== undefined && val !== '');
        let dataType = 'string';
        if (sampleValues.length > 0) {
          const firstValue = sampleValues[0];
          if (!Number.isNaN(Number(firstValue)) && firstValue !== '') {
            dataType = 'number';
          } else if (new Date(firstValue).toString() !== 'Invalid Date') {
            dataType = 'date';
          }
        }

        return {
          name: header,
          type: dataType,
          sampleValue: sampleValues[0] || null,
        };
      }); // Get 10 random data rows
      const sampleData = getRandomSample(data, 10);

      console.log('CSV parsing completed successfully, returning data');
      return {
        content,
        columns,
        sampleData,
        totalRows: data.length,
        totalColumns: columns.length,
        size: content.length,
        message: `Successfully read CSV file with ${data.length} rows and ${columns.length} columns. Showing 10 random sample rows.`,
      };
    } catch (error) {
      console.log('Error in readCsvFile tool:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            error:
              'Request timed out. The file may be too large or the server is not responding.',
            content: '',
            columns: [],
            sampleData: [],
            totalRows: 0,
          };
        }
        return {
          error: `Failed to read CSV file: ${error.message}`,
          content: '',
          columns: [],
          sampleData: [],
          totalRows: 0,
        };
      }
      return {
        error: `Failed to read CSV file: Unknown error`,
        content: '',
        columns: [],
        sampleData: [],
        totalRows: 0,
      };
    }
  },
});
