import { tool } from 'ai';
import { z } from 'zod';
import { 
  processChartData, 
  validateCsvForChart, 
  getAvailableChartTypes,
  type ChartType, 
  type ChartConfig 
} from '@/lib/chart/UnifiedChartDataProcessor';

// Fallback list of supported chart types
const SUPPORTED_CHART_TYPES = [
  'scatter', 'bar', 'line', 'pie', 'heatmap', 'radar', 'areaBump',
  'calendar', 'chord', 'circlePacking', 'sankey', 'boxplot',
  'bump', 'bullet', 'funnel', 'stream', 'sunburst', 'waffle',
  'network', 'radialbar', 'swarmplot', 'treemap', 'voronoi'
] as const;

// Function to get available chart types with fallback
function getSupportedChartTypes(): readonly string[] {
  try {
    return getAvailableChartTypes();
  } catch (error) {
    console.warn('Chart system not fully available, using fallback types:', error);
    return SUPPORTED_CHART_TYPES;
  }
}

// Simple CSV parser function for header extraction
function parseCSVHeaders(csvText: string): string[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];
  
  return lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
}

export const createInlineChart = tool({
  description: `Create an inline chart visualization from a CSV file URL that will be rendered directly in the chat. 

IMPORTANT: This tool uses the UNIFIED CHART SYSTEM for consistency and maintainability. It leverages:
- Unified chart registry for all chart types
- Standardized data validation and processing
- Consistent configuration schemas
- Server-safe imports for all chart utilities

CRITICAL: When a user uploads a CSV file, use the attachment URL from the conversation context - DO NOT use placeholder URLs like "https://file.csv" or "https://filebin.net/...".

Available chart types: ${getAvailableChartTypes().join(', ')}

The unified chart system provides:
- Consistent data validation and processing
- Standardized configuration schemas  
- Automatic column mapping and optimization
- Support for all chart types in the registry

The tool will automatically fetch the CSV file, parse all the data, and configure the chart with comprehensive optimization and validation.`,
  
  parameters: z.object({
    fileUrl: z.string().describe('The URL of the CSV file to fetch and create a chart from - MUST be the actual file URL from attachments, not a placeholder'),
    chartType: z.enum(getSupportedChartTypes() as any).describe('The type of chart to create'),
    title: z.string().describe('The title for the chart'),
    description: z.string().default('').describe('Optional description for the chart'),
    
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
    xScaleMin: z.string().optional().describe('X-axis minimum value (number or "auto")'),
    xScaleMax: z.string().optional().describe('X-axis maximum value (number or "auto")'),
    yScaleType: z.enum(['linear', 'log', 'symlog', 'time']).optional().describe('Y-axis scale type'),
    yScaleMin: z.string().optional().describe('Y-axis minimum value (number or "auto")'),
    yScaleMax: z.string().optional().describe('Y-axis maximum value (number or "auto")'),
    
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
    
    try {
      // First, fetch CSV to get headers for validation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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

      // Build chart configuration using the same structure as configureChart
      const chartConfig: any = {
        chartType,
        title,
        description: description || '',
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
          chartConfig.enableLabel = true;
          chartConfig.labelSkipWidth = 12;
          chartConfig.labelSkipHeight = 12;
          break;
        
        case 'line':
          chartConfig.dataMapping = {
            xColumn: xColumn || csvHeaders[0],
            yColumns: yColumns || csvHeaders.slice(1, 4)
          };
          chartConfig.enablePoints = enablePoints !== false;
          chartConfig.pointSize = pointSize || 8;
          chartConfig.enableCrosshair = enableCrosshair !== false;
          if (curve) chartConfig.curve = curve;
          
          if (xScaleType || xScaleMin !== undefined || xScaleMax !== undefined) {
            chartConfig.xScale = {
              type: xScaleType || 'point',
              ...(xScaleMin !== undefined && { min: xScaleMin === 'auto' ? 'auto' : Number.parseFloat(xScaleMin) || 'auto' }),
              ...(xScaleMax !== undefined && { max: xScaleMax === 'auto' ? 'auto' : Number.parseFloat(xScaleMax) || 'auto' })
            };
          }
          if (yScaleType || yScaleMin !== undefined || yScaleMax !== undefined) {
            chartConfig.yScale = {
              type: yScaleType || 'linear',
              ...(yScaleMin !== undefined && { min: yScaleMin === 'auto' ? 'auto' : Number.parseFloat(yScaleMin) || 'auto' }),
              ...(yScaleMax !== undefined && { max: yScaleMax === 'auto' ? 'auto' : Number.parseFloat(yScaleMax) || 'auto' })
            };
          }
          break;
        
        case 'pie':
          chartConfig.dataMapping = {
            idColumn: idColumn || csvHeaders[0],
            valueColumn: valueColumn || csvHeaders[1]
          };
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
          chartConfig.enableLabels = enableLabels !== false;
          chartConfig.colorScale = { scheme: 'blues' };
          break;
        
        case 'radar':
          chartConfig.dataMapping = {
            indexBy: indexBy || csvHeaders[0],
            valueColumns: valueColumns || csvHeaders.slice(1, 6)
          };
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
          chartConfig.nodeSize = nodeSize || 10;
          chartConfig.useMesh = true;
          
          if (xScaleType || xScaleMin !== undefined || xScaleMax !== undefined) {
            chartConfig.xScale = {
              type: xScaleType || 'linear',
              ...(xScaleMin !== undefined && { min: xScaleMin === 'auto' ? 'auto' : Number.parseFloat(xScaleMin) || 'auto' }),
              ...(xScaleMax !== undefined && { max: xScaleMax === 'auto' ? 'auto' : Number.parseFloat(xScaleMax) || 'auto' })
            };
          }
          if (yScaleType || yScaleMin !== undefined || yScaleMax !== undefined) {
            chartConfig.yScale = {
              type: yScaleType || 'linear',
              ...(yScaleMin !== undefined && { min: yScaleMin === 'auto' ? 'auto' : Number.parseFloat(yScaleMin) || 'auto' }),
              ...(yScaleMax !== undefined && { max: yScaleMax === 'auto' ? 'auto' : Number.parseFloat(yScaleMax) || 'auto' })
            };
          }
          break;
        
        case 'areaBump':
          chartConfig.dataMapping = {
            xColumn: xColumn || csvHeaders[0],
            seriesColumns: seriesColumns || csvHeaders.slice(1, 5)
          };
          chartConfig.interpolation = 'smooth';
          chartConfig.spacing = 8;
          break;

        // New chart types
        case 'calendar':
          chartConfig.dataMapping = {
            dateColumn: xColumn || csvHeaders[0],
            valueColumn: valueColumn || csvHeaders[1]
          };
          break;

        case 'chord':
          chartConfig.dataMapping = {
            fromColumn: xColumn || csvHeaders[0],
            toColumn: yColumn || csvHeaders[1],
            valueColumn: valueColumn || csvHeaders[2]
          };
          break;

        case 'circlePacking':
          chartConfig.dataMapping = {
            idColumn: idColumn || csvHeaders[0],
            valueColumn: valueColumn || csvHeaders[1],
            parentColumn: indexBy
          };
          break;

        case 'sankey':
          chartConfig.dataMapping = {
            sourceColumn: xColumn || csvHeaders[0],
            targetColumn: yColumn || csvHeaders[1],
            valueColumn: valueColumn || csvHeaders[2]
          };
          break;

        case 'boxplot':
          chartConfig.dataMapping = {
            groupBy: indexBy || csvHeaders[0],
            value: valueColumn || csvHeaders[1],
            subGroup: seriesColumn
          };
          break;

        case 'bump':
          chartConfig.dataMapping = {
            xColumn: xColumn || csvHeaders[0],
            seriesColumns: seriesColumns || csvHeaders.slice(1, 5)
          };
          break;

        case 'bullet':
          chartConfig.dataMapping = {
            idColumn: idColumn || csvHeaders[0],
            actualColumn: valueColumn || csvHeaders[1],
            targetColumn: csvHeaders[2]
          };
          break;

        case 'funnel':
          chartConfig.dataMapping = {
            idColumn: idColumn || csvHeaders[0],
            valueColumn: valueColumn || csvHeaders[1]
          };
          break;

        case 'stream':
          chartConfig.dataMapping = {
            xColumn: xColumn || csvHeaders[0],
            valueColumns: valueColumns || csvHeaders.slice(1, 5)
          };
          break;

        case 'sunburst':
          chartConfig.dataMapping = {
            idColumn: idColumn || csvHeaders[0],
            valueColumn: valueColumn || csvHeaders[1],
            parentColumn: indexBy
          };
          break;

        case 'waffle':
          chartConfig.dataMapping = {
            idColumn: idColumn || csvHeaders[0],
            valueColumn: valueColumn || csvHeaders[1]
          };
          break;

        case 'network':
          chartConfig.dataMapping = {
            nodeIdColumn: idColumn || csvHeaders[0],
            linkSourceColumn: xColumn || csvHeaders[0],
            linkTargetColumn: yColumn || csvHeaders[1],
            linkValueColumn: valueColumn
          };
          break;

        case 'radialbar':
          chartConfig.dataMapping = {
            idColumn: idColumn || csvHeaders[0],
            valueColumn: valueColumn || csvHeaders[1]
          };
          break;

        case 'swarmplot':
          chartConfig.dataMapping = {
            groupBy: indexBy || csvHeaders[0],
            value: valueColumn || csvHeaders[1],
            size: sizeColumn
          };
          break;

        case 'treemap':
          chartConfig.dataMapping = {
            idColumn: idColumn || csvHeaders[0],
            valueColumn: valueColumn || csvHeaders[1],
            parentColumn: indexBy
          };
          break;

        case 'voronoi':
          chartConfig.dataMapping = {
            xColumn: xColumn || csvHeaders[0],
            yColumn: yColumn || csvHeaders[1],
            idColumn: idColumn
          };
          break;
        
        default:
          return {
            error: `Unsupported chart type: ${chartType}`,
            chart: null,
          };
      }

      // Use the unified chart system for validation and data processing
      const validationResult = validateCsvForChart(chartType as ChartType, csvData, chartConfig as ChartConfig);
      if (!validationResult.valid) {
        return {
          error: `CSV validation failed: Missing columns: ${validationResult.missingColumns.join(', ')}. Available columns: ${validationResult.availableColumns.join(', ')}`,
          chart: null,
        };
      }

      // Process data using the unified chart system
      const processedData = processChartData(chartType as ChartType, csvData, chartConfig as ChartConfig);
      if (!processedData || processedData.length === 0) {
        return {
          error: 'No valid data could be processed for this chart type',
          chart: null,
        };
      }

      // Create chart object with unified system processed data
      const chart = {
        id: `chart-${chartType}-${Date.now()}`,
        type: chartType,
        title,
        description: chartConfig.description,
        config: chartConfig,
        data: processedData,
        csvData
      };

      return {
        chart,
        chartId: chart.id,
        message: `📊 **${chartType.toUpperCase()} CHART CREATED** ⚡ POWERED BY UNIFIED CHART SYSTEM - Fully validated and optimized\n\n**Chart Title**: ${title}\n**Data Points**: ${processedData.length}\n**Available Columns**: ${csvHeaders.join(', ')}\n\nChart ready for rendering!`,
        dataMapping: chartConfig.dataMapping,
        availableColumns: csvHeaders,
        appliedOptimizations: [`Validated with ${validationResult.availableColumns.length} columns`, `Processed ${processedData.length} data points`],
        suggestedNextAction: `Chart created successfully using the unified chart system. The chart is ready to be rendered inline.`
      };
      
    } catch (error) {
      
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