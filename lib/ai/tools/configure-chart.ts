// Utility function for chart configuration - no longer a standalone tool
// Used internally by chart creation tools
import { z } from 'zod';
import type { ChartConfig } from '@/lib/chart/ChartSchemas';
import { processChartData } from '@/lib/chart/ChartDataProcessor';

// Define Zod schemas for chart configuration
const BaseConfigSchema = z.object({
  title: z.string().describe('Chart title'),
  description: z.string().optional().describe('Chart description'),
  margin: z.object({
    top: z.number().min(0).max(100).optional(),
    right: z.number().min(0).max(200).optional(),
    bottom: z.number().min(0).max(100).optional(),
    left: z.number().min(0).max(200).optional(),
  }).optional(),
  theme: z.enum(['light', 'dark', 'custom']).optional(),
  colors: z.object({
    scheme: z.enum(['nivo', 'category10', 'accent', 'dark2', 'paired', 'pastel1', 'pastel2', 'set1', 'set2', 'set3']).optional(),
    customColors: z.array(z.string()).optional(),
  }).optional(),
  animate: z.boolean().optional(),
  motionConfig: z.enum(['default', 'gentle', 'wobbly', 'stiff', 'slow', 'molasses']).optional(),
});

const AxisConfigSchema = z.object({
  tickSize: z.number().min(0).max(20).optional(),
  tickPadding: z.number().min(0).max(20).optional(),
  tickRotation: z.number().min(-90).max(90).optional(),
  legend: z.string().optional(),
  legendPosition: z.enum(['start', 'middle', 'end']).optional(),
  legendOffset: z.number().min(-60).max(60).optional(),
  truncateTickAt: z.number().min(0).max(20).optional(),
}).optional();

const LegendConfigSchema = z.object({
  anchor: z.enum(['top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left', 'center']),
  direction: z.enum(['row', 'column']),
  justify: z.boolean().optional(),
  translateX: z.number().min(-200).max(200).optional(),
  translateY: z.number().min(-200).max(200).optional(),
  itemsSpacing: z.number().min(0).max(60).optional(),
  itemWidth: z.number().min(10).max(200).optional(),
  itemHeight: z.number().min(10).max(200).optional(),
  itemDirection: z.enum(['left-to-right', 'right-to-left', 'top-to-bottom', 'bottom-to-top']).optional(),
  itemOpacity: z.number().min(0).max(1).optional(),
  symbolSize: z.number().min(2).max(60).optional(),
  symbolShape: z.enum(['circle', 'diamond', 'square', 'triangle']).optional(),
}).optional();

// Chart-specific configuration schemas
const BarChartConfigSchema = BaseConfigSchema.extend({
  chartType: z.literal('bar'),
  dataMapping: z.object({
    indexBy: z.string().describe('Column name for categories (e.g., product_name, country)'),
    valueColumns: z.array(z.string()).describe('Columns for numeric values (e.g., [sales, profit, quantity])'),
  }),
  layout: z.enum(['vertical', 'horizontal']).optional(),
  groupMode: z.enum(['stacked', 'grouped']).optional(),
  padding: z.number().min(0.1).max(0.9).optional(),
  innerPadding: z.number().min(0).max(10).optional(),
  valueScale: z.object({
    type: z.enum(['linear', 'symlog']).optional(),
    min: z.union([z.number(), z.literal('auto')]).optional(),
    max: z.union([z.number(), z.literal('auto')]).optional(),
    stacked: z.boolean().optional(),
    reverse: z.boolean().optional(),
  }).optional(),
  axisTop: AxisConfigSchema,
  axisRight: AxisConfigSchema,
  axisBottom: AxisConfigSchema,
  axisLeft: AxisConfigSchema,
  enableLabel: z.boolean().optional(),
  label: z.union([z.string(), z.literal('value'), z.literal('formattedValue')]).optional(),
  labelSkipWidth: z.number().optional(),
  labelSkipHeight: z.number().optional(),
  labelTextColor: z.string().optional(),
  enableGridX: z.boolean().optional(),
  enableGridY: z.boolean().optional(),
  legends: z.array(LegendConfigSchema).optional(),
});

const LineChartConfigSchema = BaseConfigSchema.extend({
  chartType: z.literal('line'),
  dataMapping: z.object({
    xColumn: z.string().describe('Column for X-axis (e.g., date, time, month)'),
    yColumns: z.array(z.string()).describe('Columns for Y values, each becomes a line (e.g., [sales, profit])'),
  }),
  curve: z.enum(['basis', 'cardinal', 'catmullRom', 'linear', 'monotoneX', 'monotoneY', 'natural', 'step', 'stepAfter', 'stepBefore']).optional(),
  lineWidth: z.number().min(1).max(10).optional(),
  xScale: z.object({
    type: z.enum(['point', 'linear', 'time']).optional(),
    min: z.union([z.number(), z.literal('auto')]).optional(),
    max: z.union([z.number(), z.literal('auto')]).optional(),
    stacked: z.boolean().optional(),
    reverse: z.boolean().optional(),
  }).optional(),
  yScale: z.object({
    type: z.enum(['linear', 'symlog']).optional(),
    min: z.union([z.number(), z.literal('auto')]).optional(),
    max: z.union([z.number(), z.literal('auto')]).optional(),
    stacked: z.boolean().optional(),
    reverse: z.boolean().optional(),
  }).optional(),
  enablePoints: z.boolean().optional(),
  pointSize: z.number().min(4).max(20).optional(),
  pointColor: z.string().optional(),
  pointBorderWidth: z.number().optional(),
  pointBorderColor: z.string().optional(),
  enablePointLabel: z.boolean().optional(),
  pointLabel: z.string().optional(),
  pointLabelYOffset: z.number().optional(),
  enableArea: z.boolean().optional(),
  areaBaselineValue: z.number().optional(),
  areaOpacity: z.number().min(0).max(1).optional(),
  axisTop: AxisConfigSchema,
  axisRight: AxisConfigSchema,
  axisBottom: AxisConfigSchema,
  axisLeft: AxisConfigSchema,
  enableGridX: z.boolean().optional(),
  enableGridY: z.boolean().optional(),
  enableCrosshair: z.boolean().optional(),
  crosshairType: z.enum(['bottom-left', 'bottom', 'left', 'top-left', 'top', 'top-right', 'right', 'bottom-right', 'x', 'y', 'cross']).optional(),
  legends: z.array(LegendConfigSchema).optional(),
});

const PieChartConfigSchema = BaseConfigSchema.extend({
  chartType: z.literal('pie'),
  dataMapping: z.object({
    idColumn: z.string().describe('Column for slice labels (e.g., category, product)'),
    valueColumn: z.string().describe('Column for slice values (e.g., sales, count)'),
  }),
  startAngle: z.number().min(0).max(360).optional(),
  endAngle: z.number().min(0).max(360).optional(),
  fit: z.boolean().optional(),
  innerRadius: z.number().min(0).max(0.95).optional(),
  padAngle: z.number().min(0).max(45).optional(),
  cornerRadius: z.number().min(0).max(10).optional(),
  sortByValue: z.boolean().optional(),
  enableArcLabels: z.boolean().optional(),
  arcLabel: z.enum(['id', 'value', 'formattedValue']).optional(),
  arcLabelsSkipAngle: z.number().min(0).max(45).optional(),
  arcLabelsTextColor: z.string().optional(),
  arcLabelsRadiusOffset: z.number().min(0.5).max(2).optional(),
  enableArcLinkLabels: z.boolean().optional(),
  arcLinkLabel: z.enum(['id', 'value', 'formattedValue']).optional(),
  arcLinkLabelsSkipAngle: z.number().optional(),
  arcLinkLabelsTextColor: z.string().optional(),
  arcLinkLabelsThickness: z.number().min(1).max(10).optional(),
  arcLinkLabelsColor: z.string().optional(),
  legends: z.array(LegendConfigSchema).optional(),
});

const HeatmapConfigSchema = BaseConfigSchema.extend({
  chartType: z.literal('heatmap'),
  dataMapping: z.object({
    xColumn: z.string().describe('Column for X-axis categories (e.g., country, product)'),
    yColumn: z.string().describe('Column for Y-axis categories (e.g., month, category)'),
    valueColumn: z.string().describe('Column for cell values (e.g., temperature, sales)'),
  }),
  forceSquare: z.boolean().optional(),
  sizeVariation: z.number().min(0).max(1).optional(),
  cellOpacity: z.number().min(0).max(1).optional(),
  cellBorderColor: z.string().optional(),
  cellBorderWidth: z.number().min(0).max(10).optional(),
  cellShape: z.enum(['rect', 'circle']).optional(),
  colorScale: z.object({
    type: z.enum(['quantize', 'linear', 'symlog']).optional(),
    scheme: z.enum(['blues', 'greens', 'greys', 'oranges', 'purples', 'reds', 'viridis', 'inferno', 'magma', 'plasma', 'cividis', 'warm', 'cool', 'cubehelix']).optional(),
    colors: z.array(z.string()).optional(),
    min: z.union([z.number(), z.literal('auto')]).optional(),
    max: z.union([z.number(), z.literal('auto')]).optional(),
  }).optional(),
  enableLabels: z.boolean().optional(),
  labelTextColor: z.string().optional(),
  axisTop: AxisConfigSchema,
  axisRight: AxisConfigSchema,
  axisBottom: AxisConfigSchema,
  axisLeft: AxisConfigSchema,
  legends: z.array(LegendConfigSchema).optional(),
});

const RadarConfigSchema = BaseConfigSchema.extend({
  chartType: z.literal('radar'),
  dataMapping: z.object({
    indexBy: z.string().describe('Column for entity identifier (e.g., player_name, product)'),
    valueColumns: z.array(z.string()).describe('Columns for different metrics (e.g., [speed, agility, strength])'),
  }),
  maxValue: z.union([z.number(), z.literal('auto')]).optional(),
  curve: z.enum(['linearClosed', 'basisClosed', 'cardinalClosed', 'catmullRomClosed']).optional(),
  gridLevels: z.number().min(3).max(8).optional(),
  gridShape: z.enum(['circular', 'linear']).optional(),
  gridLabelOffset: z.number().min(6).max(60).optional(),
  enableDots: z.boolean().optional(),
  dotSize: z.number().min(4).max(32).optional(),
  dotColor: z.string().optional(),
  dotBorderWidth: z.number().min(0).max(10).optional(),
  dotBorderColor: z.string().optional(),
  enableDotLabel: z.boolean().optional(),
  dotLabel: z.string().optional(),
  dotLabelYOffset: z.number().optional(),
  fillOpacity: z.number().min(0).max(1).optional(),
  blendMode: z.enum(['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']).optional(),
  legends: z.array(LegendConfigSchema).optional(),
});

const ScatterPlotConfigSchema = BaseConfigSchema.extend({
  chartType: z.literal('scatter'),
  dataMapping: z.object({
    seriesColumn: z.string().optional().describe('Optional column for grouping (e.g., category, species)'),
    xColumn: z.string().describe('Column for X values (e.g., height, price)'),
    yColumn: z.string().describe('Column for Y values (e.g., weight, rating)'),
    sizeColumn: z.string().optional().describe('Optional column for point size (e.g., population, sales)'),
  }),
  nodeSize: z.union([
    z.number().min(4).max(64),
    z.object({
      from: z.number(),
      to: z.number(),
    })
  ]).optional(),
  xScale: z.object({
    type: z.enum(['linear', 'log', 'symlog', 'time']).optional(),
    min: z.union([z.number(), z.literal('auto')]).optional(),
    max: z.union([z.number(), z.literal('auto')]).optional(),
  }).optional(),
  yScale: z.object({
    type: z.enum(['linear', 'log', 'symlog', 'time']).optional(),
    min: z.union([z.number(), z.literal('auto')]).optional(),
    max: z.union([z.number(), z.literal('auto')]).optional(),
  }).optional(),
  axisTop: AxisConfigSchema,
  axisRight: AxisConfigSchema,
  axisBottom: AxisConfigSchema,
  axisLeft: AxisConfigSchema,
  enableGridX: z.boolean().optional(),
  enableGridY: z.boolean().optional(),
  useMesh: z.boolean().optional(),
  debugMesh: z.boolean().optional(),
  legends: z.array(LegendConfigSchema).optional(),
});

const AreaBumpConfigSchema = BaseConfigSchema.extend({
  chartType: z.literal('areaBump'),
  dataMapping: z.object({
    xColumn: z.string().describe('Column for time/sequence (e.g., year, month, day)'),
    seriesColumns: z.array(z.string()).describe('Columns representing different series (e.g., [brand_a, brand_b, brand_c])'),
  }),
  align: z.enum(['start', 'middle', 'end']).optional(),
  interpolation: z.enum(['smooth', 'linear']).optional(),
  spacing: z.number().min(0).max(32).optional(),
  xPadding: z.number().min(0).max(1).optional(),
  startLabel: z.boolean().optional(),
  startLabelPadding: z.number().min(0).max(32).optional(),
  startLabelTextColor: z.string().optional(),
  endLabel: z.boolean().optional(),
  endLabelPadding: z.number().min(0).max(32).optional(),
  endLabelTextColor: z.string().optional(),
  axisTop: AxisConfigSchema,
  axisBottom: AxisConfigSchema,
});

// Union schema for all chart types
const ChartConfigSchema = z.discriminatedUnion('chartType', [
  BarChartConfigSchema,
  LineChartConfigSchema,
  PieChartConfigSchema,
  HeatmapConfigSchema,
  RadarConfigSchema,
  ScatterPlotConfigSchema,
  AreaBumpConfigSchema,
]);

// Helper function to apply screenshot analysis recommendations
function applyScreenshotRecommendations(config: any, analysis: { recommendations?: string[]; configurationSuggestions?: any }) {
  if (!analysis.recommendations && !analysis.configurationSuggestions) return config;
  
  let optimizedConfig = { ...config };
  
  // Apply specific configuration suggestions if available
  if (analysis.configurationSuggestions) {
    console.log('Applying screenshot configuration suggestions:', analysis.configurationSuggestions);
    
    // Merge configuration suggestions directly
    Object.keys(analysis.configurationSuggestions).forEach(key => {
      if (key === 'margin' && optimizedConfig.margin) {
        optimizedConfig.margin = { ...optimizedConfig.margin, ...analysis.configurationSuggestions[key] };
      } else if (key === 'colors' && optimizedConfig.colors) {
        optimizedConfig.colors = { ...optimizedConfig.colors, ...analysis.configurationSuggestions[key] };
      } else {
        optimizedConfig[key] = analysis.configurationSuggestions[key];
      }
    });
  }
  
  // Also apply text-based recommendations as fallback
  if (analysis.recommendations) {
    for (const recommendation of analysis.recommendations) {
      const lower = recommendation.toLowerCase();
      
      // Apply common visual optimizations based on recommendation text
      if (lower.includes('legend') && lower.includes('bottom')) {
        if (!optimizedConfig.legends) optimizedConfig.legends = [];
        if (optimizedConfig.legends.length === 0) {
          optimizedConfig.legends.push({
            anchor: 'bottom',
            direction: 'row',
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
          });
        }
      }
      
      if (lower.includes('margin') || lower.includes('padding')) {
        if (!optimizedConfig.margin) optimizedConfig.margin = {};
        if (lower.includes('left')) optimizedConfig.margin.left = 80;
        if (lower.includes('bottom')) optimizedConfig.margin.bottom = 80;
        if (lower.includes('right')) optimizedConfig.margin.right = 40;
        if (lower.includes('top')) optimizedConfig.margin.top = 40;
      }
      
      if (lower.includes('color') && lower.includes('scheme')) {
        if (!optimizedConfig.colors) optimizedConfig.colors = {};
        optimizedConfig.colors.scheme = 'nivo';
      }
      
      if (lower.includes('label') && config.chartType === 'bar') {
        optimizedConfig.enableLabel = true;
        optimizedConfig.labelSkipWidth = 12;
        optimizedConfig.labelSkipHeight = 12;
      }
      
      if (lower.includes('grid')) {
        if (lower.includes('x')) optimizedConfig.enableGridX = true;
        if (lower.includes('y')) optimizedConfig.enableGridY = true;
      }
      
      if (lower.includes('animate')) {
        optimizedConfig.animate = true;
        optimizedConfig.motionConfig = 'gentle';
      }
    }
  }
  
  return optimizedConfig;
}

// Generate UUID for chart identification
function generateUUID(): string {
  return 'chart-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Simple CSV parser function
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

// Parameters interface for the utility function
interface ConfigureChartParams {
  chartConfig: ChartConfig;
  csvHeaders: string[];
  chartId?: string;
  screenshotAnalysis?: {
    issues?: string[];
    recommendations?: string[];
    configurationSuggestions?: any;
  };
  csvFileUrl?: string;
  maxDataPoints?: number;
  existingChartData?: any[];
}

/**
 * UNIFIED CHART CREATION UTILITY - Central function for all chart generation and configuration.
 * It ALWAYS creates a new chart with comprehensive configuration, validation, and optimization.
 * 
 * Used by:
 * - createInlineChart (for inline chart generation)
 * - Chart document creation (via artifact system)
 * 
 * Key behaviors:
 * 1. ALWAYS creates a new chart visualization with the provided configuration
 * 2. If csvFileUrl is provided: fetches data and creates chart
 * 3. If no csvFileUrl but chartId exists: uses existing chart data with new configuration  
 * 4. Applies visual optimizations and screenshot analysis recommendations
 * 5. Comprehensive validation of data mappings and column availability
 */
export async function configureChart({ 
  chartConfig, 
  csvHeaders, 
  chartId, 
  screenshotAnalysis, 
  csvFileUrl, 
  maxDataPoints = 50, 
  existingChartData 
}: ConfigureChartParams) {
    try {
      // Apply screenshot analysis recommendations if provided
      let optimizedConfig = chartConfig;
      if (screenshotAnalysis?.recommendations) {
        // Apply visual optimization recommendations
        optimizedConfig = applyScreenshotRecommendations(chartConfig, screenshotAnalysis);
      }

      // Validate that all mapped columns exist in CSV headers
      const mappedColumns: string[] = [];
      
      switch (chartConfig.chartType) {
        case 'bar':
          mappedColumns.push(chartConfig.dataMapping.indexBy);
          mappedColumns.push(...chartConfig.dataMapping.valueColumns);
          break;
        case 'line':
          mappedColumns.push(chartConfig.dataMapping.xColumn);
          mappedColumns.push(...chartConfig.dataMapping.yColumns);
          break;
        case 'pie':
          mappedColumns.push(chartConfig.dataMapping.idColumn);
          mappedColumns.push(chartConfig.dataMapping.valueColumn);
          break;
        case 'heatmap':
          mappedColumns.push(chartConfig.dataMapping.xColumn);
          mappedColumns.push(chartConfig.dataMapping.yColumn);
          mappedColumns.push(chartConfig.dataMapping.valueColumn);
          break;
        case 'radar':
          mappedColumns.push(chartConfig.dataMapping.indexBy);
          mappedColumns.push(...chartConfig.dataMapping.valueColumns);
          break;
        case 'scatter':
          if (chartConfig.dataMapping.seriesColumn) {
            mappedColumns.push(chartConfig.dataMapping.seriesColumn);
          }
          mappedColumns.push(chartConfig.dataMapping.xColumn);
          mappedColumns.push(chartConfig.dataMapping.yColumn);
          if (chartConfig.dataMapping.sizeColumn) {
            mappedColumns.push(chartConfig.dataMapping.sizeColumn);
          }
          break;
        case 'areaBump':
          mappedColumns.push(chartConfig.dataMapping.xColumn);
          mappedColumns.push(...chartConfig.dataMapping.seriesColumns);
          break;
      }
      
      // Check for missing columns
      const missingColumns = mappedColumns.filter(col => !csvHeaders.includes(col));
      if (missingColumns.length > 0) {
        return {
          error: `The following mapped columns were not found in CSV headers: ${missingColumns.join(', ')}. Available columns: ${csvHeaders.join(', ')}`,
          chartConfig: null,
        };
      }
      
      // Validate chart-specific requirements
      let validationError: string | null = null;
      
      switch (chartConfig.chartType) {
        case 'bar':
        case 'radar':
          if (chartConfig.dataMapping.valueColumns.length === 0) {
            validationError = `${chartConfig.chartType} chart requires at least one value column`;
          }
          break;
        case 'line':
          if (chartConfig.dataMapping.yColumns.length === 0) {
            validationError = 'Line chart requires at least one Y column for line series';
          }
          break;
        case 'areaBump':
          if (chartConfig.dataMapping.seriesColumns.length === 0) {
            validationError = 'Area bump chart requires at least one series column';
          }
          break;
      }
      
      if (validationError) {
        return {
          error: validationError,
          chartConfig: null,
        };
      }      // Always create the actual chart with provided configuration
      let inlineChart = null;
      let actualChartId = chartId;
      let transformedData = null;
      let dataMetadata = null;
      
      try {
        console.log('=== CHART CREATION: configureChart ===');
        console.log('Chart Type:', optimizedConfig.chartType);
        console.log('Title:', optimizedConfig.title);
        console.log('Chart ID:', chartId);
        console.log('Has CSV URL:', !!csvFileUrl);
        console.log('Has existing data:', !!existingChartData);
        
        if (csvFileUrl) {
          // Path 1: Create chart from CSV file URL
          console.log('Creating chart from CSV file URL...');
          
          // Fetch CSV data from the provided URL
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          console.log('Fetching CSV file from URL for chart creation...');
          const response = await fetch(csvFileUrl, {
            signal: controller.signal,
            headers: {
              Accept: 'text/csv, text/plain, application/vnd.ms-excel, */*',
            },
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            return {
              error: `Failed to fetch CSV file: ${response.status} ${response.statusText}`,
              chartConfig: null,
            };
          }

          const csvData = await response.text();
          console.log('CSV data length:', csvData.length, 'characters');

          // Check file size limit (1MB)
          if (csvData.length > 1024 * 1024) {
            return {
              error: 'CSV file is too large. Maximum size is 1MB.',
              chartConfig: null,
            };
          }

          if (!csvData || csvData.trim() === '') {
            return {
              error: 'CSV file is empty or could not be read',
              chartConfig: null,
            };
          }

          console.log('Parsing CSV data for chart creation...');
          const { headers, data } = parseCSV(csvData);
          console.log('Parsed headers:', headers);
          console.log('Total data rows:', data.length);

          if (data.length === 0) {
            return {
              error: 'No valid data rows found in CSV file',
              chartConfig: null,
            };
          }

          // Process data using the configuration
          const limitedCsvData = [headers.join(','), ...csvData.trim().split('\n').slice(1, maxDataPoints + 1)].join('\n');
          transformedData = processChartData(limitedCsvData, optimizedConfig as ChartConfig);
          
          dataMetadata = {
            originalDataCount: data.length,
            transformedDataCount: Array.isArray(transformedData) ? transformedData.length : 0,
            dataFields: headers,
            dataMapping: optimizedConfig.dataMapping,
            source: 'csv'
          };
          
        } else if (existingChartData && Array.isArray(existingChartData)) {
          // Path 2: Use existing chart data with new configuration
          console.log('Using existing chart data with new configuration...');
          console.log('Existing data points:', existingChartData.length);
          
          // Apply the new configuration to existing data
          // Note: This assumes existingChartData is already in the right format
          // For a more robust solution, we might need to reverse-engineer the CSV from existing data
          transformedData = existingChartData.slice(0, maxDataPoints);
          
          dataMetadata = {
            originalDataCount: existingChartData.length,
            transformedDataCount: transformedData.length,
            dataFields: [], // We don't have original field info when using existing data
            dataMapping: optimizedConfig.dataMapping,
            source: 'existing'
          };
          
        } else {
          return {
            error: 'Either csvFileUrl or existingChartData must be provided to create a chart',
            chartConfig: optimizedConfig,
          };
        }

        if (!Array.isArray(transformedData) || transformedData.length === 0) {
          return {
            error: 'Failed to transform data for chart or no valid data available',
            chartConfig: optimizedConfig,
          };
        }

        // Create inline chart object
        actualChartId = actualChartId || generateUUID();
        console.log('Generated Chart ID:', actualChartId);
        
        inlineChart = {
          type: 'chart-inline',
          chartId: actualChartId,
          chartType: optimizedConfig.chartType,
          title: optimizedConfig.title,
          description: optimizedConfig.description || '',
          data: transformedData,
          config: optimizedConfig,
          metadata: dataMetadata,
        };

        console.log('=== Chart Creation Success ===');
        console.log('Chart created successfully with ID:', actualChartId);
        console.log('Data source:', dataMetadata.source);
        console.log('Data points:', dataMetadata.transformedDataCount);
        
      } catch (chartError) {
        console.log('=== Chart Creation Error ===');
        console.log('Error details:', chartError);
        
        if (chartError instanceof Error) {
          if (chartError.name === 'AbortError') {
            return {
              error: 'Request timed out. The CSV file may be too large or the server is not responding.',
              chartConfig: null,
            };
          }
          return {
            error: `Failed to create chart: ${chartError.message}`,
            chartConfig: optimizedConfig,
          };
        }
        return {
          error: 'Failed to create chart: Unknown error',
          chartConfig: optimizedConfig,
        };
      }      return {
        chartConfig: optimizedConfig as ChartConfig,
        chartId: actualChartId,
        chart: inlineChart, // Always includes the created chart
        message: `Successfully created ${optimizedConfig.chartType} chart "${optimizedConfig.title}"${actualChartId ? ` (ID: ${actualChartId})` : ''} with data mapping: ${JSON.stringify(optimizedConfig.dataMapping)}${screenshotAnalysis?.recommendations ? ` and applied ${screenshotAnalysis.recommendations.length} visual optimizations` : ''}${inlineChart ? ` - visualization created with ${inlineChart.metadata.transformedDataCount} data points from ${inlineChart.metadata.source} source` : ''}`,
        mappedColumns,
        availableColumns: csvHeaders,
        appliedOptimizations: screenshotAnalysis?.recommendations || [],
      };
      
    } catch (error) {
      return {
        error: `Failed to configure chart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        chartConfig: null,
      };
    }
}
