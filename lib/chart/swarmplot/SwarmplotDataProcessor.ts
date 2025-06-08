import type { SwarmplotChartConfig } from './SwarmplotSchema';

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

// Swarmplot Chart Data Processor
export function processSwarmplotData(csvData: string, config: SwarmplotChartConfig): any[] {
  const { headers, data } = parseCSV(csvData);
  const { groupBy, value, size, id } = config.dataMapping;
  
  if (!data.length || !headers.includes(groupBy) || !headers.includes(value)) return [];
  
  return data.map((row, index) => {
    const point: any = {
      id: id && headers.includes(id) ? cleanString(row[id]) : `point-${index}`,
      group: cleanString(row[groupBy]),
      value: toNumber(row[value])
    };
    
    if (size && headers.includes(size)) {
      point.volume = toNumber(row[size]);
    }
    
    return point;
  }).filter(point => isFinite(point.value));
}

// Get required columns for swarmplot chart
export function getRequiredColumns(config: SwarmplotChartConfig): string[] {
  const columns = [config.dataMapping.groupBy, config.dataMapping.value];
  
  if (config.dataMapping.size) {
    columns.push(config.dataMapping.size);
  }
  if (config.dataMapping.id) {
    columns.push(config.dataMapping.id);
  }
  
  return columns;
}

// Validate CSV for swarmplot chart
export function validateCsvForSwarmplot(csvData: string, config: SwarmplotChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 