import { tool } from 'ai';
import { z } from 'zod';
import {type ChartConfig, DATA_MAPPING_EXAMPLES } from '@/lib/chart/ChartSchemas';
import { processChartData } from '@/lib/chart/ChartDataProcessor';

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

// Function to create default configuration based on chart type and available columns
function createDefaultConfig(chartType: string, headers: string[], title: string): ChartConfig {
  const numericColumns = headers.filter(h => h.toLowerCase().includes('count') || 
    h.toLowerCase().includes('value') || h.toLowerCase().includes('amount') || 
    h.toLowerCase().includes('sales') || h.toLowerCase().includes('price'));
  const stringColumns = headers.filter(h => !numericColumns.includes(h));
  
  const baseConfig = {
    title,
    description: `Auto-generated ${chartType} chart`,
    margin: { top: 50, right: 130, bottom: 50, left: 60 },
    colors: { scheme: 'nivo' as const },
    animate: true
  };

  switch (chartType) {
    case 'bar':
      return {
        ...baseConfig,
        chartType: 'bar' as const,
        dataMapping: {
          indexBy: stringColumns[0] || headers[0],
          valueColumns: numericColumns.length > 0 ? numericColumns.slice(0, 3) : [headers[1] || 'value']
        }
      };
    
    case 'line':
      return {
        ...baseConfig,
        chartType: 'line' as const,
        dataMapping: {
          xColumn: headers[0],
          yColumns: numericColumns.length > 0 ? numericColumns.slice(0, 3) : [headers[1] || 'value']
        }
      };
    
    case 'pie':
      return {
        ...baseConfig,
        chartType: 'pie' as const,
        dataMapping: {
          idColumn: stringColumns[0] || headers[0],
          valueColumn: numericColumns[0] || headers[1] || 'value'
        }
      };
    
    case 'heatmap':
      return {
        ...baseConfig,
        chartType: 'heatmap' as const,
        dataMapping: {
          xColumn: stringColumns[0] || headers[0],
          yColumn: stringColumns[1] || headers[1],
          valueColumn: numericColumns[0] || headers[2] || 'value'
        }
      };
    
    case 'radar':
      return {
        ...baseConfig,
        chartType: 'radar' as const,
        dataMapping: {
          indexBy: stringColumns[0] || headers[0],
          valueColumns: numericColumns.length > 0 ? numericColumns.slice(0, 5) : headers.slice(1, 6)
        }
      };
    
    case 'scatter':
      return {
        ...baseConfig,
        chartType: 'scatter' as const,
        dataMapping: {
          xColumn: numericColumns[0] || headers[0],
          yColumn: numericColumns[1] || headers[1],
          seriesColumn: stringColumns[0]
        }
      };
    
    case 'areaBump':
      return {
        ...baseConfig,
        chartType: 'areaBump' as const,
        dataMapping: {
          xColumn: headers[0],
          seriesColumns: numericColumns.length > 0 ? numericColumns.slice(0, 4) : headers.slice(1, 5)
        }
      };
    
    default:
      return {
        ...baseConfig,
        chartType: 'bar' as const,
        dataMapping: {
          indexBy: headers[0],
          valueColumns: [headers[1] || 'value']
        }
      };
  }
}

export const createInlineChart = tool({
  description: `Create an inline chart visualization from a CSV file URL that will be rendered directly in the chat. 

IMPORTANT: This tool will fetch the FULL CSV data from the provided URL and process it for chart creation. You don't need to provide the CSV data as a string - just provide the file URL and specify how to map CSV columns to chart data.

CRITICAL: When a user uploads a CSV file, use the attachment URL from the conversation context - DO NOT use placeholder URLs like "https://file.csv" or "https://filebin.net/...".

Use these data mapping patterns:

${Object.entries(DATA_MAPPING_EXAMPLES).map(([type, example]) => 
  `${type.toUpperCase()}: ${example.description}\nExample: ${JSON.stringify(example.example, null, 2)}`
).join('\n\n')}

The tool will automatically fetch the CSV file, parse all the data, and configure the chart based on your column mapping specifications.`,
  
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
  }),
  execute: async ({ 
    fileUrl, chartType, title, description = '', maxDataPoints = 50,
    indexBy, valueColumns, xColumn, yColumn, yColumns, idColumn, valueColumn, 
    seriesColumn, seriesColumns, sizeColumn 
  }) => {
    console.log('=== CSV TOOL EXECUTION: createInlineChart ===');
    console.log('File URL:', fileUrl);
    console.log('Chart Type:', chartType);
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Max Data Points:', maxDataPoints);
    console.log('Data Mapping Parameters:', {
      indexBy, valueColumns, xColumn, yColumn, yColumns, 
      idColumn, valueColumn, seriesColumn, seriesColumns, sizeColumn
    });
    console.log('Timestamp:', new Date().toISOString());
    
    try {
      // Fetch CSV data from the provided URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      console.log('Fetching CSV file from URL for chart creation...');
      const response = await fetch(fileUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'text/csv, text/plain, application/vnd.ms-excel, */*',
        },
      });
      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        return {
          error: `Failed to fetch CSV file: ${response.status} ${response.statusText}`,
          chart: null,
        };
      }      const csvData = await response.text();
      console.log('CSV data length:', csvData.length, 'characters');

      // Check file size limit (1MB)
      if (csvData.length > 1024 * 1024) {
        const errorMsg = 'CSV file is too large. Maximum size is 1MB.';
        console.log('Error:', errorMsg);
        return {
          error: errorMsg,
          chart: null,
        };
      }

      if (!csvData || csvData.trim() === '') {
        const errorMsg = 'CSV file is empty or could not be read';
        console.log('Error:', errorMsg);
        return {
          error: errorMsg,
          chart: null,
        };
      }

      console.log('Parsing CSV data for chart creation...');
      const { headers, data } = parseCSV(csvData);
      console.log('Parsed headers:', headers);
      console.log('Total data rows:', data.length);

      if (data.length === 0) {
        const errorMsg = 'No valid data rows found in CSV file';
        console.log('Error:', errorMsg);
        return {
          error: errorMsg,
          chart: null,
        };
      }

      // Create configuration based on provided mapping or auto-detect
      let config: ChartConfig;
      
      try {
        const baseConfig = {
          title,
          description,
          margin: { top: 50, right: 130, bottom: 50, left: 60 },
          colors: { scheme: 'nivo' as const },
          animate: true
        };

        switch (chartType) {
          case 'bar':
            config = {
              ...baseConfig,
              chartType: 'bar' as const,
              dataMapping: {
                indexBy: indexBy || headers.find(h => typeof data[0][h] === 'string') || headers[0],
                valueColumns: valueColumns || headers.filter(h => !Number.isNaN(Number(data[0][h]))).slice(0, 3)
              }
            };
            break;
          
          case 'line':
            config = {
              ...baseConfig,
              chartType: 'line' as const,
              dataMapping: {
                xColumn: xColumn || headers[0],
                yColumns: yColumns || headers.filter(h => !Number.isNaN(Number(data[0][h]))).slice(0, 3)
              }
            };
            break;
          
          case 'pie':
            config = {
              ...baseConfig,
              chartType: 'pie' as const,
              dataMapping: {
                idColumn: idColumn || headers.find(h => typeof data[0][h] === 'string') || headers[0],
                valueColumn: valueColumn || headers.find(h => !Number.isNaN(Number(data[0][h]))) || headers[1]
              }
            };
            break;
          
          case 'heatmap':
            config = {
              ...baseConfig,
              chartType: 'heatmap' as const,
              dataMapping: {
                xColumn: xColumn || headers[0],
                yColumn: yColumn || headers[1],
                valueColumn: valueColumn || headers.find(h => !Number.isNaN(Number(data[0][h]))) || headers[2]
              }
            };
            break;
          
          case 'radar':
            config = {
              ...baseConfig,
              chartType: 'radar' as const,
              dataMapping: {
                indexBy: indexBy || headers.find(h => typeof data[0][h] === 'string') || headers[0],
                valueColumns: valueColumns || headers.filter(h => !Number.isNaN(Number(data[0][h]))).slice(0, 5)
              }
            };
            break;
          
          case 'scatter':
            config = {
              ...baseConfig,
              chartType: 'scatter' as const,
              dataMapping: {
                xColumn: xColumn || headers.find(h => !Number.isNaN(Number(data[0][h]))) || headers[0],
                yColumn: yColumn || headers.filter(h => !Number.isNaN(Number(data[0][h])))[1] || headers[1],
                seriesColumn: seriesColumn,
                sizeColumn: sizeColumn
              }
            };
            break;
          
          case 'areaBump':
            config = {
              ...baseConfig,
              chartType: 'areaBump' as const,
              dataMapping: {
                xColumn: xColumn || headers[0],
                seriesColumns: seriesColumns || headers.filter(h => !Number.isNaN(Number(data[0][h]))).slice(0, 4)
              }
            };
            break;
          
          default:
            config = createDefaultConfig(chartType, headers, title);
        }
      } catch (configError) {
        // Fallback to default configuration
        config = createDefaultConfig(chartType, headers, title);
      }

      // Process data using the new configuration-based approach
      const limitedCsvData = [headers.join(','), ...csvData.trim().split('\n').slice(1, maxDataPoints + 1)].join('\n');
      const transformedData = processChartData(limitedCsvData, config);

      if (!Array.isArray(transformedData) || transformedData.length === 0) {
        return {
          error: 'Failed to transform data for chart or no valid data available',
          chart: null,
          config: config, // Include config for debugging
        };
      }      // Create inline chart object with special marker
      const chartId = generateUUID();
      console.log('Generated Chart ID:', chartId);
      console.log('Chart Data Transformation Results:');
      console.log('  Original data rows:', data.length);
      console.log('  Transformed data points:', transformedData.length);
      console.log('  Chart type:', chartType);
      console.log('  Data mapping:', config.dataMapping);
      
      const inlineChart = {
        type: 'chart-inline',
        chartId,
        chartType,
        title,
        description,
        data: transformedData,
        config: config, // Include the full configuration
        metadata: {
          originalDataCount: data.length,
          transformedDataCount: transformedData.length,
          dataFields: headers,
          dataMapping: config.dataMapping
        },
      };

      console.log('=== Chart Creation Success ===');
      console.log('Chart created successfully with ID:', chartId);
      console.log('Chart title:', title);
      console.log('Chart type:', chartType);
      console.log('Data points:', transformedData.length);
      console.log('==============================');

      return {
        chart: inlineChart,
        chartId, // Return chart ID
        message: `Created inline ${chartType} chart "${title}" with ${transformedData.length} data points. Chart ID: ${chartId}`,
        dataMapping: config.dataMapping,
        availableColumns: headers,
        suggestedNextAction: `I can take a screenshot of this chart and optimize its configuration. Would you like me to analyze and improve the chart appearance?`
      };
    } catch (error) {
      console.log('=== Chart Creation Error ===');
      console.log('Error details:', error);
      console.log('File URL:', fileUrl);
      console.log('Chart type:', chartType);
      console.log('============================');
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            error: 'Request timed out. The CSV file may be too large or the server is not responding.',
            chart: null,
          };
        }
        return {
          error: `Failed to create inline chart: ${error.message}`,
          chart: null,
        };
      }
      return {
        error: `Failed to create inline chart: Unknown error`,
        chart: null,
      };
    }
  },
});