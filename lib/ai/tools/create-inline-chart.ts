import { tool } from 'ai';
import { z } from 'zod';
import { DATA_MAPPING_EXAMPLES } from '@/lib/chart/ChartSchemas';
import { configureChart } from './configure-chart';

// Simple CSV parser function for header extraction
function parseCSVHeaders(csvText: string): string[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];
  
  return lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
}

export const createInlineChart = tool({
  description: `Create an inline chart visualization from a CSV file URL that will be rendered directly in the chat. 

IMPORTANT: This tool now uses the comprehensive chart configuration system and ALWAYS creates a new chart with proper configuration and optimization.

CRITICAL: When a user uploads a CSV file, use the attachment URL from the conversation context - DO NOT use placeholder URLs like "https://file.csv" or "https://filebin.net/...".

Use these data mapping patterns:

${Object.entries(DATA_MAPPING_EXAMPLES).map(([type, example]) => 
  `${type.toUpperCase()}: ${example.description}\nExample: ${JSON.stringify(example.example, null, 2)}`
).join('\n\n')}

The tool will automatically fetch the CSV file, parse all the data, and configure the chart with comprehensive optimization and validation.`,
  
  parameters: z.object({
    fileUrl: z.string().describe('The URL of the CSV file to fetch and create a chart from - MUST be the actual file URL from attachments, not a placeholder'),
    chartType: z.enum(['bar', 'line', 'pie', 'heatmap', 'radar', 'scatter', 'areaBump']).describe('The type of chart to create'),
    title: z.string().describe('The title for the chart'),
    description: z.string().optional().describe('Optional description for the chart'),
    
    // Data mapping parameters - the agent specifies which columns to use
    indexBy: z.string().optional().describe('Column name for categories/labels (for bar, radar charts)'),
    valueColumns: z.array(z.string()).optional().describe('Column names for numeric values (for bar, radar charts)'),
    xColumn: z.string().optional().describe('Column name for X-axis (for line, scatter, areaBump, heatmap charts)'),
    yColumn: z.string().optional().describe('Column name for Y-axis (for scatter, heatmap charts)'),
    yColumns: z.array(z.string()).optional().describe('Column names for Y values/lines (for line charts)'),
    idColumn: z.string().optional().describe('Column name for slice labels (for pie charts)'),
    valueColumn: z.string().optional().describe('Column name for values (for pie, heatmap charts)'),
    seriesColumn: z.string().optional().describe('Column name for grouping/series (for scatter charts)'),
    seriesColumns: z.array(z.string()).optional().describe('Column names for different series (for areaBump charts)'),
    sizeColumn: z.string().optional().describe('Column name for point sizes (for scatter charts)'),
    
    maxDataPoints: z.number().optional().default(50).describe('Maximum number of data points to include (default 50)'),
    
    // Enhanced configuration options
    animate: z.boolean().optional().describe('Enable chart animations'),
    colorScheme: z.enum(['nivo', 'category10', 'accent', 'dark2', 'paired', 'pastel1', 'pastel2', 'set1', 'set2', 'set3']).optional().describe('Color scheme for the chart'),
    enableLegend: z.boolean().optional().describe('Enable chart legend'),
    enableGrid: z.boolean().optional().describe('Enable grid lines'),
    
    // Advanced Scale Configuration
    xScaleType: z.enum(['linear', 'log', 'symlog', 'time', 'point']).optional().describe('X-axis scale type'),
    xScaleMin: z.union([z.number(), z.literal('auto')]).optional().describe('X-axis minimum value'),
    xScaleMax: z.union([z.number(), z.literal('auto')]).optional().describe('X-axis maximum value'),
    yScaleType: z.enum(['linear', 'log', 'symlog', 'time']).optional().describe('Y-axis scale type'),
    yScaleMin: z.union([z.number(), z.literal('auto')]).optional().describe('Y-axis minimum value'),
    yScaleMax: z.union([z.number(), z.literal('auto')]).optional().describe('Y-axis maximum value'),
    
    // Layout and styling
    marginTop: z.number().min(0).max(100).optional().describe('Top margin'),
    marginRight: z.number().min(0).max(200).optional().describe('Right margin'),
    marginBottom: z.number().min(0).max(100).optional().describe('Bottom margin'),
    marginLeft: z.number().min(0).max(200).optional().describe('Left margin'),
    
    // Chart-specific advanced options
    nodeSize: z.number().min(4).max(64).optional().describe('Point size for scatter plots'),
    enablePoints: z.boolean().optional().describe('Enable points on line charts'),
    pointSize: z.number().min(4).max(20).optional().describe('Size of points on line charts'),
    enableCrosshair: z.boolean().optional().describe('Enable crosshair on line charts'),
    innerRadius: z.number().min(0).max(0.95).optional().describe('Inner radius for pie charts (0=pie, >0=donut)'),
    enableLabels: z.boolean().optional().describe('Enable labels on charts'),
    curve: z.enum(['basis', 'cardinal', 'catmullRom', 'linear', 'monotoneX', 'monotoneY', 'natural', 'step', 'stepAfter', 'stepBefore']).optional().describe('Line curve type for line charts'),
  }),
  execute: async ({ 
    fileUrl, chartType, title, description = '', maxDataPoints = 50,
    indexBy, valueColumns, xColumn, yColumn, yColumns, idColumn, valueColumn, 
    seriesColumn, seriesColumns, sizeColumn, animate, colorScheme, enableLegend, enableGrid,
    xScaleType, xScaleMin, xScaleMax, yScaleType, yScaleMin, yScaleMax,
    marginTop, marginRight, marginBottom, marginLeft,
    nodeSize, enablePoints, pointSize, enableCrosshair, innerRadius, enableLabels, curve
  }) => {
    console.log('=== UNIFIED CHART CREATION: createInlineChart ===');
    console.log('File URL:', fileUrl);
    console.log('Chart Type:', chartType);
    console.log('Title:', title);
    console.log('Max Data Points:', maxDataPoints);
    console.log('Timestamp:', new Date().toISOString());
    
    try {
      // First, fetch CSV to get headers for validation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      console.log('Fetching CSV file to extract headers...');
      const response = await fetch(fileUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'text/csv, text/plain, application/vnd.ms-excel, */*',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          error: `Failed to fetch CSV file: ${response.status} ${response.statusText}`,
          chart: null,
        };
      }

      const csvData = await response.text();
      if (!csvData || csvData.trim() === '') {
        return {
          error: 'CSV file is empty or could not be read',
          chart: null,
        };
      }

      const csvHeaders = parseCSVHeaders(csvData);
      if (csvHeaders.length === 0) {
        return {
          error: 'No valid headers found in CSV file',
          chart: null,
        };
      }

      console.log('CSV headers extracted:', csvHeaders);

      // Build chart configuration using the same structure as configureChart
      const chartConfig: any = {
        chartType,
        title,
        description,
        margin: { top: marginTop || 50, right: marginRight || 130, bottom: marginBottom || 50, left: marginLeft || 60 },
        colors: { 
          scheme: colorScheme || 'nivo' 
        },
        animate: animate !== false, // Default to true unless explicitly disabled
      };

      // Add legends if requested
      if (enableLegend) {
        chartConfig.legends = [{
          anchor: 'bottom-right',
          direction: 'column',
          translateX: 100,
          translateY: 0,
          itemWidth: 100,
          itemHeight: 18,
        }];
      }

      // Add grid options
      if (enableGrid) {
        chartConfig.enableGridX = true;
        chartConfig.enableGridY = true;
      }

      // Build data mapping based on chart type and provided parameters
      switch (chartType) {
        case 'bar':
          chartConfig.dataMapping = {
            indexBy: indexBy || csvHeaders.find(h => typeof csvData.split('\n')[1]?.split(',')[csvHeaders.indexOf(h)] === 'string') || csvHeaders[0],
            valueColumns: valueColumns || csvHeaders.filter(h => h !== chartConfig.dataMapping?.indexBy).slice(0, 3)
          };
          // Add bar-specific optimizations
          chartConfig.enableLabel = true;
          chartConfig.labelSkipWidth = 12;
          chartConfig.labelSkipHeight = 12;
          break;
        
        case 'line':
          chartConfig.dataMapping = {
            xColumn: xColumn || csvHeaders[0],
            yColumns: yColumns || csvHeaders.slice(1, 4)
          };
          // Add line-specific optimizations
          chartConfig.enablePoints = enablePoints !== false;
          chartConfig.pointSize = pointSize || 8;
          chartConfig.enableCrosshair = enableCrosshair !== false;
          if (curve) chartConfig.curve = curve;
          
          // Add scale configuration
          if (xScaleType || xScaleMin !== undefined || xScaleMax !== undefined) {
            chartConfig.xScale = {
              type: xScaleType || 'point',
              ...(xScaleMin !== undefined && { min: xScaleMin }),
              ...(xScaleMax !== undefined && { max: xScaleMax })
            };
          }
          if (yScaleType || yScaleMin !== undefined || yScaleMax !== undefined) {
            chartConfig.yScale = {
              type: yScaleType || 'linear',
              ...(yScaleMin !== undefined && { min: yScaleMin }),
              ...(yScaleMax !== undefined && { max: yScaleMax })
            };
          }
          break;
        
        case 'pie':
          chartConfig.dataMapping = {
            idColumn: idColumn || csvHeaders[0],
            valueColumn: valueColumn || csvHeaders[1]
          };
          // Add pie-specific optimizations
          chartConfig.enableArcLabels = true;
          chartConfig.enableArcLinkLabels = true;
          chartConfig.innerRadius = innerRadius || 0.5;
          break;
        
        case 'heatmap':
          chartConfig.dataMapping = {
            xColumn: xColumn || csvHeaders[0],
            yColumn: yColumn || csvHeaders[1],
            valueColumn: valueColumn || csvHeaders[2]
          };
          // Add heatmap-specific optimizations
          chartConfig.enableLabels = enableLabels !== false;
          chartConfig.colorScale = { scheme: 'blues' };
          break;
        
        case 'radar':
          chartConfig.dataMapping = {
            indexBy: indexBy || csvHeaders[0],
            valueColumns: valueColumns || csvHeaders.slice(1, 6)
          };
          // Add radar-specific optimizations
          chartConfig.enableDots = true;
          chartConfig.dotSize = 8;
          chartConfig.fillOpacity = 0.25;
          break;
        
        case 'scatter':
          chartConfig.dataMapping = {
            xColumn: xColumn || csvHeaders[0],
            yColumn: yColumn || csvHeaders[1],
            seriesColumn: seriesColumn,
            sizeColumn: sizeColumn
          };
          // Add scatter-specific optimizations
          chartConfig.nodeSize = nodeSize || 10;
          chartConfig.useMesh = true;
          
          // Add scale configuration for scatter plots
          if (xScaleType || xScaleMin !== undefined || xScaleMax !== undefined) {
            chartConfig.xScale = {
              type: xScaleType || 'linear',
              ...(xScaleMin !== undefined && { min: xScaleMin }),
              ...(xScaleMax !== undefined && { max: xScaleMax })
            };
          }
          if (yScaleType || yScaleMin !== undefined || yScaleMax !== undefined) {
            chartConfig.yScale = {
              type: yScaleType || 'linear',
              ...(yScaleMin !== undefined && { min: yScaleMin }),
              ...(yScaleMax !== undefined && { max: yScaleMax })
            };
          }
          break;
        
        case 'areaBump':
          chartConfig.dataMapping = {
            xColumn: xColumn || csvHeaders[0],
            seriesColumns: seriesColumns || csvHeaders.slice(1, 5)
          };
          // Add area bump specific optimizations
          chartConfig.interpolation = 'smooth';
          chartConfig.spacing = 8;
          break;
        
        default:
          return {
            error: `Unsupported chart type: ${chartType}`,
            chart: null,
          };
      }

      console.log('Built chart configuration:', chartConfig);
      console.log('Data mapping:', chartConfig.dataMapping);

      // Use configureChart utility to handle the actual chart creation with full validation and optimization
      const configureResult = await configureChart({
        chartConfig,
        csvHeaders,
        csvFileUrl: fileUrl,
        maxDataPoints,
      });

      if (configureResult.error) {
        console.log('Configure chart error:', configureResult.error);
        return {
          error: configureResult.error,
          chart: null,
        };
      }

      console.log('=== Unified Chart Creation Success ===');
      console.log('Chart ID:', configureResult.chartId);
      console.log('Chart created with comprehensive configuration system');
      console.log('======================================');

      return {
        chart: configureResult.chart,
        chartId: configureResult.chartId,
        message: `${configureResult.message} (Created via unified chart system)`,
        dataMapping: configureResult.chartConfig?.dataMapping,
        availableColumns: configureResult.availableColumns,
        appliedOptimizations: configureResult.appliedOptimizations,
        suggestedNextAction: `Chart created with comprehensive configuration. Use captureChartScreenshot tool to take a visual screenshot and analyze how to improve the chart if needed.`
      };
      
    } catch (error) {
      console.log('=== Unified Chart Creation Error ===');
      console.log('Error details:', error);
      console.log('File URL:', fileUrl);
      console.log('Chart type:', chartType);
      console.log('===================================');
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            error: 'Request timed out. The CSV file may be too large or the server is not responding.',
            chart: null,
          };
        }
        return {
          error: `Failed to create chart: ${error.message}`,
          chart: null,
        };
      }
      return {
        error: `Failed to create chart: Unknown error`,
        chart: null,
      };
    }
  },
});