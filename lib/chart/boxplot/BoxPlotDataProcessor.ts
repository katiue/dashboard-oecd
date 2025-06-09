import type { BoxPlotChartConfig } from './BoxPlotSchema';

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

// Calculate quartiles and statistics for box plot
function calculateStats(values: number[]): any {
  if (values.length === 0) return null;
  
  const sorted = values.sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const medianIndex = Math.floor(sorted.length * 0.5);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  const q1 = sorted[q1Index];
  const median = sorted[medianIndex];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  const min = Math.max(sorted[0], q1 - 1.5 * iqr);
  const max = Math.min(sorted[sorted.length - 1], q3 + 1.5 * iqr);
  
  const outliers = sorted.filter(v => v < min || v > max);
  
  return {
    min,
    q1,
    median,
    q3,
    max,
    outliers
  };
}

// Box Plot Chart Data Processor
export function processBoxPlotData(csvData: string, config: BoxPlotChartConfig): any[] {
  const { headers, data } = parseCSV(csvData);
  const { groupBy, value, subGroup } = config.dataMapping;
  
  if (!data.length || !headers.includes(groupBy) || !headers.includes(value)) return [];
  
  // Group data by groupBy column and optionally by subGroup
  const groupedData: Record<string, number[]> = {};
  
  data.forEach(row => {
    const groupKey = cleanString(row[groupBy]);
    const valueNum = toNumber(row[value]);
    
    if (Number.isFinite(valueNum)) {
      const finalKey = subGroup && headers.includes(subGroup) 
        ? `${groupKey} - ${cleanString(row[subGroup])}`
        : groupKey;
      
      if (!groupedData[finalKey]) {
        groupedData[finalKey] = [];
      }
      groupedData[finalKey].push(valueNum);
    }
  });
  
  // Calculate statistics for each group
  return Object.entries(groupedData).map(([group, values]) => {
    const stats = calculateStats(values);
    if (!stats) return null;
    
    return {
      group,
      ...stats
    };
  }).filter(Boolean);
}

// Get required columns for box plot chart
export function getRequiredColumns(config: BoxPlotChartConfig): string[] {
  const columns = [config.dataMapping.groupBy, config.dataMapping.value];
  if (config.dataMapping.subGroup) {
    columns.push(config.dataMapping.subGroup);
  }
  return columns;
}

// Validate CSV for box plot chart
export function validateCsvForBoxPlot(csvData: string, config: BoxPlotChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 