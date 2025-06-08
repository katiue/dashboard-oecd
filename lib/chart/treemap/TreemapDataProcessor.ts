import type { TreemapChartConfig } from './TreemapSchema';

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

// Build hierarchy for TreeMap
function buildTreemapHierarchy(data: any[], config: TreemapChartConfig): any {
  const { idColumn, parentColumn, valueColumn, labelColumn } = config.dataMapping;
  
  if (parentColumn) {
    // Hierarchical data with parent relationships
    const nodeMap = new Map<string, any>();
    const rootNodes: any[] = [];
    
    // First pass: create all nodes
    data.forEach(row => {
      const id = cleanString(row[idColumn]);
      const parent = parentColumn ? cleanString(row[parentColumn]) : null;
      const value = toNumber(row[valueColumn]);
      
      const node: any = {
        id,
        name: labelColumn ? cleanString(row[labelColumn]) : id,
        value: value > 0 ? value : 0,
        children: []
      };
      
      nodeMap.set(id, node);
      
      if (!parent || parent === '' || parent === 'null') {
        rootNodes.push(node);
      }
    });
    
    // Second pass: build parent-child relationships
    data.forEach(row => {
      const id = cleanString(row[idColumn]);
      const parent = parentColumn ? cleanString(row[parentColumn]) : null;
      
      if (parent && parent !== '' && parent !== 'null') {
        const parentNode = nodeMap.get(parent);
        const childNode = nodeMap.get(id);
        
        if (parentNode && childNode) {
          parentNode.children.push(childNode);
        }
      }
    });
    
    // If there's only one root, return it; otherwise wrap in a container
    if (rootNodes.length === 1) {
      return rootNodes[0];
    } else {
      return {
        id: 'root',
        name: 'Root',
        children: rootNodes
      };
    }
  } else {
    // Flat data - create a simple hierarchy
    const children = data.map((row, index) => ({
      id: cleanString(row[idColumn]) || `item-${index}`,
      name: labelColumn ? cleanString(row[labelColumn]) : cleanString(row[idColumn]) || `item-${index}`,
      value: toNumber(row[valueColumn])
    })).filter(item => item.value > 0);
    
    return {
      id: 'root',
      name: 'Root',
      children
    };
  }
}

// TreeMap Chart Data Processor
export function processTreemapData(csvData: string, config: TreemapChartConfig): any {
  const { headers, data } = parseCSV(csvData);
  const { idColumn, valueColumn } = config.dataMapping;
  
  if (!data.length || !headers.includes(idColumn) || !headers.includes(valueColumn)) {
    return { id: 'root', name: 'Root', children: [] };
  }
  
  return buildTreemapHierarchy(data, config);
}

// Get required columns for treemap chart
export function getRequiredColumns(config: TreemapChartConfig): string[] {
  const columns = [config.dataMapping.idColumn, config.dataMapping.valueColumn];
  
  if (config.dataMapping.parentColumn) {
    columns.push(config.dataMapping.parentColumn);
  }
  if (config.dataMapping.labelColumn) {
    columns.push(config.dataMapping.labelColumn);
  }
  
  return columns;
}

// Validate CSV for treemap chart
export function validateCsvForTreemap(csvData: string, config: TreemapChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 