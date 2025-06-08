import { tool } from 'ai';
import { z } from 'zod';

// Simple CSV parser function to avoid papaparse import issues
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

export const filterCsvData = tool({
  description:
    'Filter CSV data based on conditions (e.g., value > 30, category = "sales", etc.) and return 10 random matching rows. Only use this tool when you already have CSV data available as a string in the conversation context.',
  parameters: z.object({
    csvData: z.string().describe('The raw CSV data as a string'),
    column: z.string().describe('The column name to filter on'),
    operator: z
      .string()
      .describe(
        'The comparison operator: >, <, >=, <=, =, !=, contains, starts_with, ends_with',
      ),
    value: z
      .string()
      .describe(
        'The value to compare against (will be converted to number for numeric comparisons)',
      ),
  }),
  execute: async ({ csvData, column, operator, value }) => {
    try {
      if (!csvData || csvData.trim() === '') {
        return {
          error: 'No CSV data provided',
          filteredData: [],
          matchCount: 0,
          sampleCount: 0,
        };
      }

      const { headers, data } = parseCSV(csvData);

      if (data.length === 0) {
        return {
          error: 'No valid data rows found',
          filteredData: [],
          matchCount: 0,
          sampleCount: 0,
        };
      }

      // Limit the number of rows to process (max 10,000 rows)
      const maxRows = 10000;
      const limitedData = data.slice(0, maxRows);

      // Apply single filter
      const filteredData = limitedData.filter((row) => {
        const cellValue = row[column];
        if (cellValue === null || cellValue === undefined || cellValue === '') {
          return false;
        }

        const cellStr = String(cellValue).trim();

        switch (operator) {
          case '>':
            return Number(cellValue) > Number(value);
          case '<':
            return Number(cellValue) < Number(value);
          case '>=':
            return Number(cellValue) >= Number(value);
          case '<=':
            return Number(cellValue) <= Number(value);
          case '=':
            return cellStr.toLowerCase() === String(value).toLowerCase();
          case '!=':
            return cellStr.toLowerCase() !== String(value).toLowerCase();
          case 'contains':
            return cellStr.toLowerCase().includes(String(value).toLowerCase());
          case 'starts_with':
            return cellStr
              .toLowerCase()
              .startsWith(String(value).toLowerCase());
          case 'ends_with':
            return cellStr.toLowerCase().endsWith(String(value).toLowerCase());
          default:
            return false;
        }
      }); // Get 10 random samples from filtered data
      const sampleData = getRandomSample(filteredData, 10);

      let message = `Found ${filteredData.length} matching rows, returning ${sampleData.length} random samples.`;
      if (data.length > maxRows) {
        message += ` Note: Only processed first ${maxRows} rows of ${data.length} total rows for performance.`;
      }
      return {
        filteredData: sampleData,
        matchCount: filteredData.length,
        sampleCount: sampleData.length,
        message,
        appliedFilter: { column, operator, value },
      };
    } catch (error) {
      return {
        error: `Failed to filter CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filteredData: [],
        matchCount: 0,
        sampleCount: 0,
      };
    }
  },
});
