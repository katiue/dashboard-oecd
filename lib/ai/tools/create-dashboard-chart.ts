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

// Simple CSV parser function
function parseCSV(csvText: string): { headers: string[], data: Record<string, any>[] } {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      const numValue = parseFloat(value);
      row[header] = isNaN(numValue) ? value : numValue;
    });
    return row;
  });
  return { headers, data };
}

interface CreateDashboardChartProps {
  dataStream: DataStreamWriter;
}

export const createDashboardChart = ({ dataStream }: CreateDashboardChartProps) => tool({
  description: `Create dashboard charts with data processing capabilities. This tool loads CSV data, applies processing, and creates visualizations with duplicate detection and sorting options.`,

  parameters: z.object({
    csvUrl: z.string().describe('URL to the CSV data source'),
    chartType: z.enum(getSupportedChartTypes()).describe('Type of chart to create'),
    title: z.string().describe('Chart title'),
    description: z.string().optional().describe('Chart description'),
    
    // Data mapping parameters (same as createDashboardChart)
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
    
    // Duplicate detection
    checkDuplicates: z.boolean().optional().default(true).describe('Check for duplicate values and warn'),
    duplicateThreshold: z.number().optional().default(0.3).describe('Warn if more than this fraction of values are duplicates (0.3 = 30%)'),
    
    // Commentary
    insights: z.string().optional().describe('Key insights or findings from the data'),
    methodology: z.string().optional().describe('Methodology or approach used for analysis'),
  }),

  execute: async ({ 
    csvUrl, 
    chartType, 
    title, 
    description, 
    indexBy, valueColumns, xColumn, yColumn, yColumns, idColumn, valueColumn, seriesColumn,
    removeNulls,
    limitRows,
    sortBy,
    sortOrder,
    checkDuplicates,
    duplicateThreshold,
    insights, 
    methodology
  }) => {
    // Handle defaults for optional parameters
    const finalDescription = description || '';
    const finalRemoveNulls = removeNulls ?? false;
    const finalLimitRows = limitRows ?? 1000;
    const finalCheckDuplicates = checkDuplicates ?? true;
    const finalDuplicateThreshold = duplicateThreshold ?? 0.3;
    const finalInsights = insights || '';
    const finalMethodology = methodology || '';
          console.log('🚀 createDashboardChart called with:', {
        csvUrl,
        chartType,
        title,
        description: finalDescription,
        indexBy, valueColumns, xColumn, yColumn, yColumns, idColumn, valueColumn, seriesColumn,
        removeNulls: finalRemoveNulls,
        limitRows: finalLimitRows,
        sortBy,
        sortOrder,
        checkDuplicates: finalCheckDuplicates,
        duplicateThreshold: finalDuplicateThreshold,
        insights: finalInsights,
        methodology: finalMethodology
      });
    try {
      const chartId = generateUUID();
      
      // Step 1: Load data from CSV URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(csvUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'text/csv, text/plain, application/vnd.ms-excel, */*',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch CSV file: ${response.status} ${response.statusText}`);
      }

      const csvData = await response.text();
      const { headers, data } = parseCSV(csvData);
      
      let processedData = data;
      const processingSteps: string[] = [`Loaded ${data.length} rows from ${csvUrl}`];
      
      // Step 2: Apply basic processing
      if (finalRemoveNulls) {
        const initialCount = processedData.length;
        processedData = processedData.filter(row => 
          headers.every(header => 
            row[header] !== null && row[header] !== undefined && row[header] !== ''
          )
        );
        const removed = initialCount - processedData.length;
        if (removed > 0) {
          processingSteps.push(`Removed ${removed} rows with null values`);
        }
      }
      
      if (finalLimitRows && finalLimitRows < processedData.length) {
        processedData = processedData.slice(0, finalLimitRows);
        processingSteps.push(`Limited to first ${finalLimitRows} rows`);
      }
      
      // Step 2.5: Apply sorting if specified
      if (sortBy && headers.includes(sortBy)) {
        processedData.sort((a, b) => {
          const aVal = a[sortBy];
          const bVal = b[sortBy];
          
          // Handle different data types
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
          } else {
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            if (sortOrder === 'desc') {
              return bStr.localeCompare(aStr);
            } else {
              return aStr.localeCompare(bStr);
            }
          }
        });
        processingSteps.push(`Sorted by ${sortBy} (${sortOrder || 'asc'})`);
      }
      
      // Step 2.6: Check for duplicates and generate warnings
      const warnings: string[] = [];
      if (finalCheckDuplicates) {
        // Check for duplicate IDs in the main identifier column
        const mainIdColumn = indexBy || idColumn || headers[0];
        if (mainIdColumn && headers.includes(mainIdColumn)) {
          const values = processedData.map(row => row[mainIdColumn]);
          const uniqueValues = new Set(values);
          const duplicateRatio = 1 - (uniqueValues.size / values.length);
          
          if (duplicateRatio > finalDuplicateThreshold) {
            const duplicateCount = values.length - uniqueValues.size;
            warnings.push(`⚠️ HIGH DUPLICATE WARNING: ${Math.round(duplicateRatio * 100)}% of ${mainIdColumn} values are duplicates (${duplicateCount} duplicates out of ${values.length} total). Consider grouping or aggregating data for better visualization.`);
          }
        }
        
        // Check other key columns for duplicates too
        headers.forEach(header => {
          if (header !== mainIdColumn) {
            const values = processedData.map(row => row[header]);
            const uniqueValues = new Set(values);
            const duplicateRatio = 1 - (uniqueValues.size / values.length);
            
            if (duplicateRatio > 0.8) { // Higher threshold for other columns
              warnings.push(`📊 Column '${header}' has ${Math.round(duplicateRatio * 100)}% duplicate values - may affect chart clarity.`);
            }
          }
        });
      }
      
      // Step 3: Build data mapping based on chart type (similar to createDashboardChart)
      let dataMapping: any = {};
      
      switch (chartType) {
        case 'bar':
          dataMapping = {
            indexBy: indexBy || headers.find(h => typeof data[0]?.[h] === 'string') || headers[0],
            valueColumns: valueColumns || headers.filter(h => typeof data[0]?.[h] === 'number').slice(0, 3)
          };
          break;
        case 'line':
          dataMapping = {
            xColumn: xColumn || headers[0],
            yColumns: yColumns || headers.filter(h => typeof data[0]?.[h] === 'number').slice(0, 3)
          };
          break;
        case 'pie':
          dataMapping = {
            idColumn: idColumn || headers.find(h => typeof data[0]?.[h] === 'string') || headers[0],
            valueColumn: valueColumn || headers.find(h => typeof data[0]?.[h] === 'number') || headers[1]
          };
          break;
        case 'scatter':
          dataMapping = {
            xColumn: xColumn || headers.find(h => typeof data[0]?.[h] === 'number') || headers[0],
            yColumn: yColumn || headers.filter(h => typeof data[0]?.[h] === 'number')[1] || headers[1],
            seriesColumn: seriesColumn || headers.find(h => typeof data[0]?.[h] === 'string')
          };
          break;
        case 'heatmap':
          dataMapping = {
            xColumn: xColumn || headers.find(h => typeof data[0]?.[h] === 'string') || headers[0],
            yColumn: yColumn || headers.filter(h => typeof data[0]?.[h] === 'string')[1] || headers[1],
            valueColumn: valueColumn || headers.find(h => typeof data[0]?.[h] === 'number') || headers[2]
          };
          break;
        case 'radar':
          dataMapping = {
            indexBy: indexBy || headers.find(h => typeof data[0]?.[h] === 'string') || headers[0],
            valueColumns: valueColumns || headers.filter(h => typeof data[0]?.[h] === 'number').slice(0, 5)
          };
          break;
        default:
          // Generic mapping for other chart types
          dataMapping = {
            indexBy: indexBy || headers[0],
            valueColumns: valueColumns || headers.slice(1, 4),
            xColumn: xColumn || headers[0],
            yColumn: yColumn || headers[1],
            idColumn: idColumn || headers[0],
            valueColumn: valueColumn || headers[1]
          };
      }

      // Step 4: Build chart configuration
      const finalChartConfig = {
        chartType,
        title,
        description: finalDescription || `${chartType} chart showing data from ${csvUrl}`,
        margin: { top: 50, right: 110, bottom: 50, left: 60 },
        colors: { scheme: 'nivo' },
        dataMapping,
      };
      
      // Step 5: Generate commentary
      const enhancedCommentary = {
        visualization: `This ${chartType} chart visualizes ${title.toLowerCase()}.`,
        importance: finalInsights || `This visualization helps understand patterns and trends in the data.`,
        insights: finalInsights || null,
        methodology: finalMethodology || `Data loaded from ${csvUrl}${processingSteps.length > 1 ? `, processed through: ${processingSteps.slice(1).join(', ')}` : ''}.`,
      };
      
      // Step 6: Create the enhanced dashboard chart object
      const enhancedChart = {
        id: chartId,
        title,
        description: finalChartConfig.description,
        chartType,
        config: finalChartConfig,
        data: processedData,
        commentary: enhancedCommentary,
        
        // Enhanced features
        processingSteps,
        metadata: {
          originalSource: csvUrl,
          processedAt: new Date().toISOString(),
          dataShape: [processedData.length, headers.length],
          processingSteps,
        }
      };
      
      // Step 7: Stream the enhanced chart to the UI and add to dashboard
      console.log('📊 Streaming enhanced chart to UI:', {
        chartId: enhancedChart.id,
        chartType: enhancedChart.chartType,
        dataLength: enhancedChart.data?.length,
        title: enhancedChart.title
      });
      
      // Send chart data to dashboard via data stream
      dataStream.writeData({
        type: 'dashboard-chart',
        content: {
          chart: enhancedChart,
          csvData,
          action: 'add'
        }
      });
      
      // Also send the chart creation event for UI display
      dataStream.writeData({
        type: 'create-dashboard-chart',
        chart: enhancedChart
      });
      
      if (warnings.length > 0) {
        dataStream.writeData({
          type: 'warnings',
          content: warnings
        });
      }
      
      const result = {
        success: true,
        chartId,
        warnings: warnings.length > 0 ? warnings : [],
        message: `Dashboard chart created successfully! 
        
📊 **Chart Details:**
- Type: ${chartType}
- Title: ${title}
- Data Source: ${csvUrl}
- Processed Rows: ${processedData.length}
- Columns: ${headers.length}

🔄 **Processing Pipeline:**
${processingSteps.map(step => `• ${step}`).join('\n')}

${warnings.length > 0 ? `\n⚠️ **Data Quality Warnings:**\n${warnings.map(w => `• ${w}`).join('\n')}\n` : ''}

The chart uses processed data with sorting and duplicate detection.`
      };
      
      console.log('✅ createDashboardChart success:', {
        chartId: result.chartId,
        success: result.success,
        warningsCount: warnings.length,
        messageLength: result.message.length
      });
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        chartId: null
      };
      console.error('❌ createDashboardChart error:', errorResult);
      return errorResult;
    }
  }
});