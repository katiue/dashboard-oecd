import type { HeatmapChartConfig } from './HeatmapSchema';

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

// Heatmap Chart Data Processor
export function processHeatmapData(csvData: string, config: HeatmapChartConfig): any[] {
  const { headers, data } = parseCSV(csvData);
  const { xColumn, yColumn, valueColumn } = config.dataMapping;
  
  if (!data.length || !headers.includes(xColumn) || !headers.includes(yColumn) || !headers.includes(valueColumn)) return [];
  
  return data.map(row => ({
    x: cleanString(row[xColumn]) || 'unknown',
    y: cleanString(row[yColumn]) || 'unknown',
    v: toNumber(row[valueColumn])
  })).filter(point => point.x !== 'unknown' && point.y !== 'unknown' && Number.isFinite(point.v));
}

// Get required columns for heatmap chart
export function getRequiredColumns(config: HeatmapChartConfig): string[] {
  return [config.dataMapping.xColumn, config.dataMapping.yColumn, config.dataMapping.valueColumn];
}

// Validate CSV for heatmap chart
export function validateCsvForHeatmap(csvData: string, config: HeatmapChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 