import { tool } from 'ai';
import { z } from 'zod';
import * as ChartTransforms from '@/lib/chart/ChartTransforms';

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

export const analyzeCsvData = tool({
  description: 'Analyze CSV data and return basic information including column names, data types, first 10 rows for preview, and create chart suggestions for inline rendering',
  parameters: z.object({
    csvData: z.string().describe('The raw CSV data as a string'),
    createCharts: z.boolean().optional().default(true).describe('Whether to create chart visualizations from the data'),
  }),
  execute: async ({ csvData, createCharts = true }) => {
    try {
      if (!csvData || csvData.trim() === '') {
        return {
          error: 'No CSV data provided',
          columns: [],
          preview: [],
          rowCount: 0,
        };
      }

      const { headers, data } = parseCSV(csvData);

      if (data.length === 0) {
        return {
          error: 'No valid data rows found',
          columns: [],
          preview: [],
          rowCount: 0,
        };
      }

      // Get column information
      const columns = headers.map(header => {
        // Analyze data type by looking at the first few non-empty values
        const sampleValues = data.slice(0, 10)
          .map(row => row[header])
          .filter(val => val !== null && val !== undefined && val !== '');
        
        let dataType = 'string';
        if (sampleValues.length > 0) {
          const firstValue = sampleValues[0];
          if (!isNaN(Number(firstValue)) && firstValue !== '') {
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

      // Return only first 10 rows for preview
      const preview = data.slice(0, 10);

      let chartSuggestions = null;

      if (createCharts) {
        // Create chart suggestions based on the data
        const numericColumns = columns.filter(col => col.type === 'number');
        const stringColumns = columns.filter(col => col.type === 'string');
        
        chartSuggestions = [];

        // Suggest a bar chart if we have categorical and numeric data
        if (stringColumns.length > 0 && numericColumns.length > 0) {
          const barData = ChartTransforms.transformForBarChart(data);
          if (barData.length > 0) {
            chartSuggestions.push({
              type: 'chart-inline',
              chartType: 'bar',
              title: `${numericColumns[0]?.name || 'Values'} by ${stringColumns[0]?.name || 'Category'}`,
              data: barData.slice(0, 20), // Limit to 20 items for performance
            });
          }
        }

        // Suggest a pie chart for categorical data with numeric values
        if (stringColumns.length > 0 && numericColumns.length > 0) {
          const pieData = ChartTransforms.transformForPieChart(data);
          if (pieData.length > 0) {
            chartSuggestions.push({
              type: 'chart-inline',
              chartType: 'pie',
              title: `Distribution of ${numericColumns[0]?.name || 'Values'}`,
              data: pieData.slice(0, 10), // Limit to 10 slices for readability
            });
          }
        }

        // Suggest a line chart if we have time-series or sequential data
        if (numericColumns.length >= 2) {
          const lineData = ChartTransforms.transformForLineChart(data);
          if (lineData.length > 0) {
            chartSuggestions.push({
              type: 'chart-inline',
              chartType: 'line',
              title: `Trend Analysis`,
              data: lineData,
            });
          }
        }
      }

      return {
        columns,
        preview,
        rowCount: data.length,
        totalColumns: columns.length,
        chartSuggestions,
        message: `Successfully analyzed CSV with ${data.length} rows and ${columns.length} columns. Showing first 10 rows as preview.${chartSuggestions ? ` Generated ${chartSuggestions.length} chart visualization(s).` : ''}`
      };

    } catch (error) {
      return {
        error: `Failed to analyze CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        columns: [],
        preview: [],
        rowCount: 0,
      };
    }
  },
}); 