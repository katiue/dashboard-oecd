import type { SankeyChartConfig } from './SankeySchema';

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

// Convert CSV to Sankey nodes and links format
function buildSankeyData(data: any[], config: SankeyChartConfig): { nodes: any[], links: any[] } {
  const { sourceColumn, targetColumn, valueColumn } = config.dataMapping;
  
  const nodeSet = new Set<string>();
  const links: any[] = [];
  
  // Process each row to create links and collect unique nodes
  data.forEach((row, index) => {
    const source = cleanString(row[sourceColumn]);
    const target = cleanString(row[targetColumn]);
    const value = toNumber(row[valueColumn]);
    
    if (source !== 'Unknown' && target !== 'Unknown' && value > 0) {
      nodeSet.add(source);
      nodeSet.add(target);
      
      links.push({
        source,
        target,
        value
      });
    }
  });
  
  // Create nodes array
  const nodes = Array.from(nodeSet).map(id => ({
    id,
    nodeColor: 'hsl(206, 70%, 50%)' // Default color, can be customized
  }));
  
  return { nodes, links };
}

// Sankey Chart Data Processor
export function processSankeyData(csvData: string, config: SankeyChartConfig): any {
  const { headers, data } = parseCSV(csvData);
  const { sourceColumn, targetColumn, valueColumn } = config.dataMapping;
  
  if (!data.length || 
      !headers.includes(sourceColumn) || 
      !headers.includes(targetColumn) || 
      !headers.includes(valueColumn)) {
    return { nodes: [], links: [] };
  }
  
  // Filter out invalid data
  const validData = data.filter(item => {
    const source = cleanString(item[sourceColumn]);
    const target = cleanString(item[targetColumn]);
    const value = toNumber(item[valueColumn]);
    return source !== 'Unknown' && target !== 'Unknown' && value > 0;
  });
  
  if (validData.length === 0) {
    return { nodes: [], links: [] };
  }
  
  return buildSankeyData(validData, config);
}

// Get required columns for sankey chart
export function getRequiredColumns(config: SankeyChartConfig): string[] {
  return [
    config.dataMapping.sourceColumn,
    config.dataMapping.targetColumn,
    config.dataMapping.valueColumn
  ];
}

// Validate CSV for sankey chart
export function validateCsvForSankey(csvData: string, config: SankeyChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 