import type { ChordChartConfig } from './ChordSchema';

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

// Convert CSV data to chord matrix format
function csvToMatrix(csvData: string, config: ChordChartConfig): { matrix: number[][], keys: string[] } {
  const { headers, data } = parseCSV(csvData);
  const { fromColumn, toColumn, valueColumn } = config.dataMapping;
  
  if (!fromColumn || !toColumn || !valueColumn) {
    return { matrix: [], keys: [] };
  }
  
  if (!headers.includes(fromColumn) || !headers.includes(toColumn) || !headers.includes(valueColumn)) {
    return { matrix: [], keys: [] };
  }

  // Get unique nodes
  const nodesSet = new Set<string>();
  data.forEach(row => {
    nodesSet.add(cleanString(row[fromColumn]));
    nodesSet.add(cleanString(row[toColumn]));
  });
  
  const keys = Array.from(nodesSet).sort();
  const nodeIndex = new Map(keys.map((key, index) => [key, index]));
  
  // Initialize matrix
  const matrix: number[][] = keys.map(() => new Array(keys.length).fill(0));
  
  // Fill matrix with values
  data.forEach(row => {
    const from = cleanString(row[fromColumn]);
    const to = cleanString(row[toColumn]);
    const value = toNumber(row[valueColumn]);
    
    const fromIndex = nodeIndex.get(from);
    const toIndex = nodeIndex.get(to);
    
    if (fromIndex !== undefined && toIndex !== undefined && value > 0) {
      matrix[fromIndex][toIndex] = value;
    }
  });
  
  return { matrix, keys };
}

// Chord Chart Data Processor
export function processChordData(csvData: string, config: ChordChartConfig): any {
  // If matrix is provided directly in config, use it
  if (config.dataMapping.matrix && config.dataMapping.matrix.length > 0) {
    return {
      matrix: config.dataMapping.matrix,
      keys: config.dataMapping.keys || config.dataMapping.matrix.map((_, i) => `Node ${i + 1}`)
    };
  }
  
  // Otherwise convert CSV to matrix
  const { matrix, keys } = csvToMatrix(csvData, config);
  
  if (matrix.length === 0) {
    return { matrix: [], keys: [] };
  }
  
  return { matrix, keys };
}

// Get required columns for chord chart
export function getRequiredColumns(config: ChordChartConfig): string[] {
  const columns: string[] = [];
  
  // If using CSV format
  if (config.dataMapping.fromColumn) {
    columns.push(config.dataMapping.fromColumn);
  }
  if (config.dataMapping.toColumn) {
    columns.push(config.dataMapping.toColumn);
  }
  if (config.dataMapping.valueColumn) {
    columns.push(config.dataMapping.valueColumn);
  }
  
  return columns;
}

// Validate CSV for chord chart
export function validateCsvForChord(csvData: string, config: ChordChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  // If using matrix data, no CSV validation needed
  if (config.dataMapping.matrix && config.dataMapping.matrix.length > 0) {
    return {
      valid: true,
      missingColumns: [],
      availableColumns: []
    };
  }
  
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 