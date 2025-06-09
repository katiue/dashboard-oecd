import type { LineChartConfig } from './LineSchema';

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

// Helper function to convert string values to numbers
function toNumber(value: string | number): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) && !Number.isNaN(value) ? value : 0;
  }
  const cleaned = String(value).trim();
  if (cleaned === '' || cleaned === 'null' || cleaned === 'undefined') {
    return 0;
  }
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) && !Number.isNaN(num) ? num : 0;
}

// Helper function to clean string values
function cleanString(value: any): string {
  if (value === null || value === undefined) {
    return 'Unknown';
  }
  const cleaned = String(value).trim();
  return cleaned || 'Unknown';
}

// Helper function to convert string to Date for time scales
function toDate(value: any): Date | null {
  if (value instanceof Date) {
    return value;
  }
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const cleaned = String(value).trim();
  if (cleaned === '' || cleaned === 'null' || cleaned === 'undefined') {
    return null;
  }
  
  const date = new Date(cleaned);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Helper function to process X values based on scale type
function processXValue(value: any, xScaleType?: string): any {
  if (xScaleType === 'time') {
    const date = toDate(value);
    return date || new Date(); // Return current date as fallback for invalid dates
  }
  
  // For linear scales, try to convert to number
  if (xScaleType === 'linear') {
    const num = toNumber(value);
    return Number.isFinite(num) ? num : 0;
  }
  
  // For point scales or default, return as string
  return cleanString(value);
}

// Line Chart Data Processor
export function processLineData(csvData: string, config: LineChartConfig): any[] {
  const { headers, data } = parseCSV(csvData);
  const { xColumn, yColumns } = config.dataMapping;
  
  if (!data.length || !headers.includes(xColumn)) return [];
  
  const xScaleType = config.xScale?.type;
  
  return yColumns
    .filter(col => headers.includes(col))
    .map(yCol => ({
      id: cleanString(yCol),
      data: data.map(row => {
        const xValue = processXValue(row[xColumn], xScaleType);
        const yValue = toNumber(row[yCol]);
        
        // Skip invalid data points
        if (xScaleType === 'time' && xValue instanceof Date && Number.isNaN(xValue.getTime())) {
          return null;
        }
        if (xScaleType === 'linear' && !Number.isFinite(xValue)) {
          return null;
        }
        if (!Number.isFinite(yValue)) {
          return null;
        }
        
        return {
          x: xValue,
          y: yValue
        };
      }).filter(point => point !== null)
    }))
    .filter(series => series.data.length > 0);
}

// Get required columns for line chart
export function getRequiredColumns(config: LineChartConfig): string[] {
  return [config.dataMapping.xColumn, ...config.dataMapping.yColumns];
}

// Validate CSV for line chart
export function validateCsvForLine(csvData: string, config: LineChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 