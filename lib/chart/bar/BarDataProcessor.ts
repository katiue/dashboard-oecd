import type { BarChartConfig } from './BarSchema';

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

// Bar Chart Data Processor
export function processBarData(csvData: string, config: BarChartConfig): any[] {
  const { headers, data } = parseCSV(csvData);
  const { indexBy, valueColumns } = config.dataMapping;
  
  if (!data.length || !headers.includes(indexBy)) return [];
  
  return data.map((row, index) => {
    const result: any = {
      [indexBy]: cleanString(row[indexBy]) || `item-${index}`
    };
    
    valueColumns.forEach(col => {
      if (headers.includes(col)) {
        result[col] = toNumber(row[col]);
      }
    });
    
    return result;
  }).filter(item => item && Object.values(item).some(v => typeof v === 'number' && v > 0));
}

// Get required columns for bar chart
export function getRequiredColumns(config: BarChartConfig): string[] {
  const columns: string[] = [];
  columns.push(config.dataMapping.indexBy);
  columns.push(...config.dataMapping.valueColumns);
  return columns;
}

// Validate CSV for bar chart
export function validateCsvForBar(csvData: string, config: BarChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 