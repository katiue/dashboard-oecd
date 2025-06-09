import type { PieChartConfig } from './PieSchema';

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

// Pie Chart Data Processor
export function processPieData(csvData: string, config: PieChartConfig): any[] {
  const { headers, data } = parseCSV(csvData);
  const { idColumn, valueColumn } = config.dataMapping;
  
  if (!data.length || !headers.includes(idColumn) || !headers.includes(valueColumn)) return [];
  
  const processedData = data.map((row, index) => ({
    id: cleanString(row[idColumn]) || `item-${index}`,
    label: cleanString(row[idColumn]) || `item-${index}`,
    value: toNumber(row[valueColumn])
  })).filter(item => item.value > 0);

  // Sort by value if specified
  if (config.sortByValue) {
    processedData.sort((a, b) => b.value - a.value);
  }

  return processedData;
}

// Get required columns for pie chart
export function getRequiredColumns(config: PieChartConfig): string[] {
  return [config.dataMapping.idColumn, config.dataMapping.valueColumn];
}

// Validate CSV for pie chart
export function validateCsvForPie(csvData: string, config: PieChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 