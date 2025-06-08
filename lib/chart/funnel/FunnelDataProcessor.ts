import type { FunnelChartConfig } from './FunnelSchema';

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

// Funnel Chart Data Processor
export function processFunnelData(csvData: string, config: FunnelChartConfig): any[] {
  const { headers, data } = parseCSV(csvData);
  const { idColumn, valueColumn, labelColumn } = config.dataMapping;
  
  if (!data.length || !headers.includes(idColumn) || !headers.includes(valueColumn)) return [];
  
  return data.map((row, index) => {
    const item: any = {
      id: cleanString(row[idColumn]) || `step-${index}`,
      value: toNumber(row[valueColumn])
    };
    
    // Add custom label if column exists
    if (labelColumn && headers.includes(labelColumn)) {
      item.label = cleanString(row[labelColumn]);
    }
    
    return item;
  }).filter(item => item.value > 0); // Only include items with positive values
}

// Get required columns for funnel chart
export function getRequiredColumns(config: FunnelChartConfig): string[] {
  const columns = [config.dataMapping.idColumn, config.dataMapping.valueColumn];
  
  if (config.dataMapping.labelColumn) {
    columns.push(config.dataMapping.labelColumn);
  }
  
  return columns;
}

// Validate CSV for funnel chart
export function validateCsvForFunnel(csvData: string, config: FunnelChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 