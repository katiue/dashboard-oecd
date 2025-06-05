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
    'Read a CSV file from a URL (e.g., uploaded file), parse it, and return 10 random data rows (or fewer if the file has less than 10 rows) along with column information for analysis and preview. IMPORTANT: This tool only returns a SAMPLE of the data for analysis. If you need to create charts or visualizations, you must use chart creation tools (like createInlineChart) which will fetch and process the FULL CSV data automatically. CRITICAL: When a user uploads a CSV file, use the attachment URL from the conversation context - DO NOT use placeholder URLs like "https://file.csv".',
  parameters: z.object({
    fileUrl: z.string().describe('The URL of the CSV file to read - MUST be the actual file URL from attachments, not a placeholder'),
  }),  execute: async ({ fileUrl }) => {
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

      if (!response.ok) {
        return {
          error: `Failed to fetch file: ${response.status} ${response.statusText}`,
          content: '',
          columns: [],
          sampleData: [],
          totalRows: 0,
        };
      }

      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (
        contentType &&
        !contentType.includes('text/csv') &&
        !contentType.includes('text/plain') &&
        !contentType.includes('application/vnd.ms-excel')
      ) {
        const errorMsg = 'File does not appear to be a CSV file';
        console.log('Error:', errorMsg);
        return {
          error: errorMsg,
          content: '',
          columns: [],
          sampleData: [],
          totalRows: 0,
        };
      }
      
      const content = await response.text();
      console.log('Content length:', content.length, 'characters');

      // Check file size limit (1MB)
      if (content.length > 1024 * 1024) {
        const errorMsg = 'File is too large. Maximum size is 1MB.';
        console.log('Error:', errorMsg);
        return {
          error: errorMsg,
          content: '',
          columns: [],
          sampleData: [],
          totalRows: 0,
        };
      }

            if (!content || content.trim() === '') {
        const errorMsg = 'File is empty or could not be read';
        console.log('Error:', errorMsg);
        return {
          error: errorMsg,
          content: '',
          columns: [],
          sampleData: [],
          totalRows: 0,
        };
      }

      console.log('Parsing CSV content...');
      // Parse the CSV data
      const { headers, data } = parseCSV(content);
      console.log('Parsed headers:', headers);
      console.log('Total data rows:', data.length);

      if (data.length === 0) {
        const errorMsg = 'No valid data rows found in CSV';
        console.log('Error:', errorMsg);
        return {
          error: errorMsg,
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
      });

      // Get 10 random data rows
      const sampleData = getRandomSample(data, 10);
      
      console.log('Column analysis:', columns.map(col => `${col.name} (${col.type})`));
      console.log('Sample data rows:', sampleData.length);
      console.log('=== END CSV TOOL EXECUTION ===');
      
      return {
        content,
        columns,
        sampleData,
        totalRows: data.length,
        totalColumns: columns.length,
        size: content.length,
        message: `Successfully read CSV file with ${data.length} rows and ${columns.length} columns. Showing ${sampleData.length} random sample rows for analysis. To create charts or visualizations, use chart creation tools which will process the full dataset.`,
      };    } catch (error) {
      console.log('=== CSV TOOL ERROR ===');
      console.log('Error details:', error);
      console.log('File URL:', fileUrl);
      console.log('======================');
      
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
