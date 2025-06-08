import type { StreamChartConfig } from './StreamSchema';

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
    return isFinite(value) && !isNaN(value) ? value : 0;
  }
  const cleaned = String(value).trim();
  if (cleaned === '' || cleaned === 'null' || cleaned === 'undefined') {
    return 0;
  }
  const num = Number.parseFloat(cleaned);
  return isFinite(num) && !isNaN(num) ? num : 0;
}

// Helper function to clean string values
function cleanString(value: any): string {
  if (value === null || value === undefined) {
    return 'Unknown';
  }
  const cleaned = String(value).trim();
  return cleaned || 'Unknown';
}

// Stream Chart Data Processor
export function processStreamData(csvData: string, config: StreamChartConfig): any[] {
  const { headers, data } = parseCSV(csvData);
  const { xColumn, valueColumns } = config.dataMapping;
  
  if (!data.length || !headers.includes(xColumn)) return [];
  
  // Convert to stream format: array of objects with x and multiple y values
  return data.map(row => {
    const streamPoint: any = {
      [xColumn]: cleanString(row[xColumn]) || 'unknown'
    };
    
    valueColumns
      .filter(col => headers.includes(col))
      .forEach(col => {
        streamPoint[col] = toNumber(row[col]);
      });
    
    return streamPoint;
  }).filter(point => 
    point[xColumn] !== 'unknown' && 
    valueColumns.some(col => isFinite(point[col]) && point[col] >= 0)
  );
}

// Get required columns for stream chart
export function getRequiredColumns(config: StreamChartConfig): string[] {
  return [config.dataMapping.xColumn, ...config.dataMapping.valueColumns];
}

// Validate CSV for stream chart
export function validateCsvForStream(csvData: string, config: StreamChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 