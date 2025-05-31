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

function getTransformFunction(chartType: string) {
  switch (chartType) {
    case 'bar':
      return ChartTransforms.transformForBarChart;
    case 'line':
      return ChartTransforms.transformForLineChart;
    case 'pie':
      return ChartTransforms.transformForPieChart;
    case 'heatmap':
      return ChartTransforms.transformForHeatmapChart;
    case 'radar':
      return ChartTransforms.transformForRadarChart;
    case 'scatter':
      return ChartTransforms.transformForScatterChart;
    case 'areaBump':
      return ChartTransforms.transformForAreaBumpChart;
    default:
      return ChartTransforms.transformForBarChart;
  }
}

export const createInlineChart = tool({
  description: 'Create an inline chart visualization from CSV data that will be rendered directly in the chat. Use this when you want to show a quick chart preview.',
  parameters: z.object({
    csvData: z.string().describe('The raw CSV data as a string'),
    chartType: z.enum(['bar', 'line', 'pie', 'heatmap', 'radar', 'scatter', 'areaBump']).describe('The type of chart to create'),
    title: z.string().describe('The title for the chart'),
    description: z.string().optional().describe('Optional description for the chart'),
    maxDataPoints: z.number().optional().default(50).describe('Maximum number of data points to include (default 50)'),
  }),
  execute: async ({ csvData, chartType, title, description = '', maxDataPoints = 50 }) => {
    try {
      if (!csvData || csvData.trim() === '') {
        return {
          error: 'No CSV data provided',
          chart: null,
        };
      }

      const { headers, data } = parseCSV(csvData);

      if (data.length === 0) {
        return {
          error: 'No valid data rows found',
          chart: null,
        };
      }

      // Get transform function
      const transformFn = getTransformFunction(chartType);

      // Transform data using the appropriate function
      const transformedData = transformFn(data.slice(0, maxDataPoints));

      if (!Array.isArray(transformedData) || transformedData.length === 0) {
        return {
          error: 'Failed to transform data for chart or no valid data available',
          chart: null,
        };
      }

      // Create inline chart object with special marker
      const inlineChart = {
        type: 'chart-inline',
        chartType,
        title,
        description,
        data: transformedData,
        metadata: {
          originalDataCount: data.length,
          transformedDataCount: transformedData.length,
          dataFields: headers,
        },
      };

      return {
        chart: inlineChart,
        message: `Created inline ${chartType} chart "${title}" with ${transformedData.length} data points.`,
        dataPreview: transformedData.slice(0, 3), // Show first 3 transformed data points for debugging
      };

    } catch (error) {
      return {
        error: `Failed to create inline chart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        chart: null,
      };
    }
  },
}); 