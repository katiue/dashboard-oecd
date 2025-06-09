import type { NetworkChartConfig } from './NetworkSchema';

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

// Network Chart Data Processor
export function processNetworkData(csvData: string, config: NetworkChartConfig): any {
  const { headers, data } = parseCSV(csvData);
  const { nodeIdColumn, nodeGroupColumn, nodeSizeColumn, linkSourceColumn, linkTargetColumn, linkValueColumn } = config.dataMapping;
  
  if (!data.length || !headers.includes(nodeIdColumn)) return { nodes: [], links: [] };
  
  // Build nodes from data
  const nodeMap = new Map<string, any>();
  const links: any[] = [];
  
  data.forEach((row, index) => {
    const nodeId = cleanString(row[nodeIdColumn]);
    
    if (!nodeMap.has(nodeId)) {
      const node: any = {
        id: nodeId,
        radius: nodeSizeColumn && headers.includes(nodeSizeColumn) ? toNumber(row[nodeSizeColumn]) : 8
      };
      
      if (nodeGroupColumn && headers.includes(nodeGroupColumn)) {
        node.group = cleanString(row[nodeGroupColumn]);
      }
      
      nodeMap.set(nodeId, node);
    }
    
    // Process links if columns are available
    if (linkSourceColumn && linkTargetColumn && headers.includes(linkSourceColumn) && headers.includes(linkTargetColumn)) {
      const source = cleanString(row[linkSourceColumn]);
      const target = cleanString(row[linkTargetColumn]);
      
      if (source && target && source !== target) {
        const link: any = {
          source,
          target,
          distance: linkValueColumn && headers.includes(linkValueColumn) ? toNumber(row[linkValueColumn]) : 100
        };
        
        links.push(link);
        
        // Ensure both source and target nodes exist
        if (!nodeMap.has(source)) {
          nodeMap.set(source, { id: source, radius: 8 });
        }
        if (!nodeMap.has(target)) {
          nodeMap.set(target, { id: target, radius: 8 });
        }
      }
    }
  });
  
  const nodes = Array.from(nodeMap.values());
  
  return { nodes, links };
}

// Get required columns for network chart
export function getRequiredColumns(config: NetworkChartConfig): string[] {
  const columns = [config.dataMapping.nodeIdColumn];
  
  if (config.dataMapping.nodeGroupColumn) {
    columns.push(config.dataMapping.nodeGroupColumn);
  }
  if (config.dataMapping.nodeSizeColumn) {
    columns.push(config.dataMapping.nodeSizeColumn);
  }
  if (config.dataMapping.linkSourceColumn) {
    columns.push(config.dataMapping.linkSourceColumn);
  }
  if (config.dataMapping.linkTargetColumn) {
    columns.push(config.dataMapping.linkTargetColumn);
  }
  if (config.dataMapping.linkValueColumn) {
    columns.push(config.dataMapping.linkValueColumn);
  }
  
  return columns;
}

// Validate CSV for network chart
export function validateCsvForNetwork(csvData: string, config: NetworkChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 