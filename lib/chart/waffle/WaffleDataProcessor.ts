import type { WaffleChartConfig } from './WaffleSchema';

// Simple CSV parser
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

export function processWaffleData(csvData: string, config: WaffleChartConfig): any[] {
  const { headers, data } = parseCSV(csvData);
  const { idColumn, valueColumn } = config.dataMapping;
  
  if (!data.length || !headers.includes(idColumn) || !headers.includes(valueColumn)) return [];
  
  return data.map((row, index) => ({
    id: row[idColumn] || `item-${index}`,
    label: row[idColumn] || `item-${index}`,
    value: Number.parseFloat(row[valueColumn]) || 0
  })).filter(item => item.value > 0);
}

export function getRequiredColumns(config: WaffleChartConfig): string[] {
  return [config.dataMapping.idColumn, config.dataMapping.valueColumn];
}

export function validateCsvForWaffle(csvData: string, config: WaffleChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 