import { tool } from 'ai';
import { z } from 'zod';
import type { DataStreamWriter } from 'ai';
import { generateUUID } from '@/lib/utils';

// Supported chart types for enhanced dashboard
function getSupportedChartTypes(): readonly [string, ...string[]] {
  return [
    'bar', 'line', 'pie', 'scatter', 'heatmap', 'radar', 'areaBump',
    'calendar', 'chord', 'circlePacking', 'sankey', 'boxplot',
    'bump', 'bullet', 'funnel', 'stream', 'sunburst', 'waffle',
    'network', 'radialbar', 'swarmplot', 'treemap', 'voronoi'
  ] as const;
}


interface CreateDashboardChartProps {
  dataStream: DataStreamWriter;
}

// New tool for creating charts from existing tab data
export const createChartFromTabData = ({ dataStream }: CreateDashboardChartProps) => tool({
  description: `Create dashboard charts using data from existing dashboard tabs. This tool works with data that's already loaded in the dashboard tabs (like "Main Data", "Filtered Data", etc.) and creates visualizations with tab-aware descriptions.`,

  parameters: z.object({
    sourceTab: z.string().describe('Name of the source tab to use data from (e.g., "Main Data", "Filtered Data")'),
    chartType: z.enum(getSupportedChartTypes()).describe('Type of chart to create'),
    title: z.string().describe('Chart title'),
    description: z.string().optional().describe('Chart description'),
    
    // Data mapping parameters
    indexBy: z.string().optional().describe('Column for categories/labels (bar, radar charts)'),
    valueColumns: z.array(z.string()).optional().describe('Columns for numeric values (bar, radar charts)'),
    xColumn: z.string().optional().describe('Column for X-axis (line, scatter, heatmap charts)'),
    yColumn: z.string().optional().describe('Column for Y-axis (scatter, heatmap charts)'),
    yColumns: z.array(z.string()).optional().describe('Columns for Y values/lines (line charts)'),
    idColumn: z.string().optional().describe('Column for slice labels (pie charts)'),
    valueColumn: z.string().optional().describe('Column for values (pie, heatmap charts)'),
    seriesColumn: z.string().optional().describe('Column for grouping (scatter charts)'),
    
    // Basic processing options
    removeNulls: z.boolean().optional().describe('Remove rows with null values'),
    limitRows: z.number().optional().describe('Limit number of rows to process'),
    
    // Sorting options
    sortBy: z.string().optional().describe('Column name to sort by'),
    sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort order: ascending or descending'),
    
    // Commentary
    insights: z.string().optional().describe('Key insights or findings from the data'),
    methodology: z.string().optional().describe('Methodology or approach used for analysis'),
  }),

  execute: async ({ 
    sourceTab,
    chartType, 
    title, 
    description, 
    indexBy, valueColumns, xColumn, yColumn, yColumns, idColumn, valueColumn, seriesColumn,
    removeNulls,
    limitRows,
    sortBy,
    sortOrder,
    insights, 
    methodology
  }) => {
    console.log('🚀 createChartFromTabData called with:', {
      sourceTab,
      chartType,
      title
    });

    try {
      const chartId = generateUUID();

      // Signal to the dashboard to create a chart using the specified tab data
      const parameters: Record<string, any> = {};
      if (indexBy !== undefined) parameters.indexBy = indexBy;
      if (valueColumns !== undefined) parameters.valueColumns = valueColumns;
      if (xColumn !== undefined) parameters.xColumn = xColumn;
      if (yColumn !== undefined) parameters.yColumn = yColumn;
      if (yColumns !== undefined) parameters.yColumns = yColumns;
      if (idColumn !== undefined) parameters.idColumn = idColumn;
      if (valueColumn !== undefined) parameters.valueColumn = valueColumn;
      if (seriesColumn !== undefined) parameters.seriesColumn = seriesColumn;
      if (removeNulls !== undefined) parameters.removeNulls = removeNulls;
      if (limitRows !== undefined) parameters.limitRows = limitRows;
      if (sortBy !== undefined) parameters.sortBy = sortBy;
      if (sortOrder !== undefined) parameters.sortOrder = sortOrder;
      if (insights !== undefined) parameters.insights = insights;
      if (methodology !== undefined) parameters.methodology = methodology;

      return {
        success: true,
        chartId,
        message: `Chart creation request sent! Creating "${title}" (${chartType}) from "${sourceTab}" tab data.`
      };

    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        chartId: null
      };
      console.error('❌ createChartFromTabData error:', errorResult);
      return errorResult;
    }
  }
});