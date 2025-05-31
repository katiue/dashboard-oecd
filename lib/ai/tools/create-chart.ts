import { tool } from 'ai';
import { z } from 'zod';
import * as ChartTransforms from '@/lib/chart/ChartTransforms';

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

export const createChart = tool({
  description: 'Create a chart configuration using filtered CSV data. Supports bar, line, pie, heatmap, radar, scatter, and areaBump charts.',
  parameters: z.object({
    chartType: z.enum(['bar', 'line', 'pie', 'heatmap', 'radar', 'scatter', 'areaBump']).describe('The type of chart to create'),
    data: z.array(z.record(z.any())).describe('The filtered data rows to use for the chart'),
    title: z.string().describe('The title for the chart'),
    description: z.string().optional().describe('Optional description for the chart'),
    xAxis: z.string().optional().describe('Column name for X-axis (for bar, line, scatter charts)'),
    yAxis: z.string().optional().describe('Column name for Y-axis (for bar, line, scatter charts)'),
    valueColumn: z.string().optional().describe('Column name for the value (for pie charts)'),
    labelColumn: z.string().optional().describe('Column name for labels (for pie charts)'),
    groupByColumn: z.string().optional().describe('Column to group data by (for multi-series charts)'),
  }),
  execute: async ({ 
    chartType, 
    data, 
    title, 
    description = '', 
    xAxis, 
    yAxis, 
    valueColumn, 
    labelColumn,
    groupByColumn 
  }) => {
    try {
      if (!data || data.length === 0) {
        return {
          error: 'No data provided for chart creation',
          chart: null,
        };
      }

      // Get transform function
      const transformFn = getTransformFunction(chartType);

      // Create metadata for the transform function
      const meta = {
        fields: Object.keys(data[0] || {}),
        xAxis,
        yAxis,
        valueColumn,
        labelColumn,
        groupByColumn,
      };

      // Transform data using the appropriate function
      const transformedData = transformFn(data, meta);

      if (!Array.isArray(transformedData)) {
        return {
          error: 'Failed to transform data for chart',
          chart: null,
        };
      }

      // Create chart configuration
      const chartConfig = {
        chartType,
        title,
        description,
        data: transformedData,
        metadata: {
          originalDataCount: data.length,
          transformedDataCount: transformedData.length,
          xAxis,
          yAxis,
          valueColumn,
          labelColumn,
          groupByColumn,
        },
      };

      return {
        chart: chartConfig,
        message: `Successfully created ${chartType} chart with ${transformedData.length} data points`,
        dataPreview: transformedData.slice(0, 5), // Show first 5 transformed data points
      };

    } catch (error) {
      return {
        error: `Failed to create chart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        chart: null,
      };
    }
  },
}); 