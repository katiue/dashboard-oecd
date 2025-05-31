import { tool } from 'ai';
import { z } from 'zod';

// Simple CSV parser function to avoid papaparse import issues
function parseCSV(csvText: string): { headers: string[], data: Record<string, string>[] } {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return { headers: [], data: [] };
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
  
  return { headers, data };
}

export const filterCsvData = tool({
  description: 'Filter CSV data based on conditions (e.g., value > 30, category = "sales", etc.) and return matching rows',
  parameters: z.object({
    csvData: z.string().describe('The raw CSV data as a string'),
    filters: z.array(z.object({
      column: z.string().describe('The column name to filter on'),
      operator: z.enum(['>', '<', '>=', '<=', '=', '!=', 'contains', 'starts_with', 'ends_with']).describe('The comparison operator'),
      value: z.union([z.string(), z.number()]).describe('The value to compare against'),
    })).describe('Array of filter conditions to apply'),
    limit: z.number().optional().default(100).describe('Maximum number of rows to return (default 100)'),
  }),
  execute: async ({ csvData, filters, limit = 100 }) => {
    try {
      if (!csvData || csvData.trim() === '') {
        return {
          error: 'No CSV data provided',
          filteredData: [],
          matchCount: 0,
        };
      }

      const { headers, data } = parseCSV(csvData);

      if (data.length === 0) {
        return {
          error: 'No valid data rows found',
          filteredData: [],
          matchCount: 0,
        };
      }

      // Apply filters
      const filteredData = data.filter(row => {
        return filters.every(filter => {
          const cellValue = row[filter.column];
          if (cellValue === null || cellValue === undefined || cellValue === '') {
            return false;
          }

          const cellStr = String(cellValue).trim();
          const filterValue = filter.value;

          switch (filter.operator) {
            case '>':
              return Number(cellValue) > Number(filterValue);
            case '<':
              return Number(cellValue) < Number(filterValue);
            case '>=':
              return Number(cellValue) >= Number(filterValue);
            case '<=':
              return Number(cellValue) <= Number(filterValue);
            case '=':
              return cellStr.toLowerCase() === String(filterValue).toLowerCase();
            case '!=':
              return cellStr.toLowerCase() !== String(filterValue).toLowerCase();
            case 'contains':
              return cellStr.toLowerCase().includes(String(filterValue).toLowerCase());
            case 'starts_with':
              return cellStr.toLowerCase().startsWith(String(filterValue).toLowerCase());
            case 'ends_with':
              return cellStr.toLowerCase().endsWith(String(filterValue).toLowerCase());
            default:
              return false;
          }
        });
      });

      // Limit results
      const limitedData = filteredData.slice(0, limit);

      return {
        filteredData: limitedData,
        matchCount: filteredData.length,
        returnedCount: limitedData.length,
        message: `Found ${filteredData.length} matching rows, returning first ${limitedData.length} rows.`,
        appliedFilters: filters,
      };

    } catch (error) {
      return {
        error: `Failed to filter CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filteredData: [],
        matchCount: 0,
      };
    }
  },
}); 