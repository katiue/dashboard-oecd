import type { CirclePackingChartConfig } from './CirclePackingSchema';

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

// Convert flat data to hierarchical structure
function buildHierarchy(data: any[], config: CirclePackingChartConfig): any {
  const { idColumn, parentColumn, valueColumn, categoryColumn } = config.dataMapping;
  
  // If no parent column, create a simple grouped structure
  if (!parentColumn) {
    if (categoryColumn) {
      // Group by category
      const grouped = data.reduce((acc, item) => {
        const category = cleanString(item[categoryColumn]) || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = {
            id: category,
            children: []
          };
        }
        acc[category].children.push({
          id: cleanString(item[idColumn]),
          value: toNumber(item[valueColumn])
        });
        return acc;
      }, {} as Record<string, any>);
      
      return {
        id: 'root',
        children: Object.values(grouped)
      };
    } else {
      // Flat structure with no grouping
      return {
        id: 'root',
        children: data.map(item => ({
          id: cleanString(item[idColumn]),
          value: toNumber(item[valueColumn])
        }))
      };
    }
  }
  
  // Build tree structure with parent-child relationships
  const nodeMap = new Map();
  const roots: any[] = [];
  
  // First pass: create all nodes
  data.forEach(item => {
    const id = cleanString(item[idColumn]);
    const value = toNumber(item[valueColumn]);
    
    nodeMap.set(id, {
      id,
      value,
      children: []
    });
  });
  
  // Second pass: establish parent-child relationships
  data.forEach(item => {
    const id = cleanString(item[idColumn]);
    const parentId = cleanString(item[parentColumn]);
    const node = nodeMap.get(id);
    
    if (parentId && parentId !== 'Unknown' && nodeMap.has(parentId)) {
      const parent = nodeMap.get(parentId);
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });
  
  // If we have multiple roots, wrap them
  if (roots.length > 1) {
    return {
      id: 'root',
      children: roots
    };
  } else if (roots.length === 1) {
    return roots[0];
  } else {
    return { id: 'root', children: [] };
  }
}

// Circle Packing Chart Data Processor
export function processCirclePackingData(csvData: string, config: CirclePackingChartConfig): any {
  const { headers, data } = parseCSV(csvData);
  const { idColumn, valueColumn } = config.dataMapping;
  
  if (!data.length || !headers.includes(idColumn) || !headers.includes(valueColumn)) {
    return { id: 'root', children: [] };
  }
  
  // Filter out invalid data
  const validData = data.filter(item => {
    const id = cleanString(item[idColumn]);
    const value = toNumber(item[valueColumn]);
    return id !== 'Unknown' && value > 0;
  });
  
  if (validData.length === 0) {
    return { id: 'root', children: [] };
  }
  
  return buildHierarchy(validData, config);
}

// Get required columns for circle packing chart
export function getRequiredColumns(config: CirclePackingChartConfig): string[] {
  const columns = [config.dataMapping.idColumn, config.dataMapping.valueColumn];
  
  if (config.dataMapping.parentColumn) {
    columns.push(config.dataMapping.parentColumn);
  }
  if (config.dataMapping.categoryColumn) {
    columns.push(config.dataMapping.categoryColumn);
  }
  
  return columns;
}

// Validate CSV for circle packing chart
export function validateCsvForCirclePacking(csvData: string, config: CirclePackingChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = [config.dataMapping.idColumn, config.dataMapping.valueColumn];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 