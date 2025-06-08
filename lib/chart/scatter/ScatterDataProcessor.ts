// Scatter Plot Data Processor
import { ScatterPlotConfig } from './ScatterSchema';

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

// Scatter Plot Data Processor
export function processScatterData(csvData: string, config: ScatterPlotConfig): any[] {
  const { headers, data } = parseCSV(csvData);
  const { seriesColumn, xColumn, yColumn, sizeColumn } = config.dataMapping;
  
  if (!data.length || !headers.includes(xColumn) || !headers.includes(yColumn)) return [];
  
  // If no series column, create a single series
  if (!seriesColumn || !headers.includes(seriesColumn)) {
    const points = data.map(row => {
      const x = toNumber(row[xColumn]);
      const y = toNumber(row[yColumn]);
      
      if (!isFinite(x) || !isFinite(y)) return null;
      
      const point: any = { x, y };
        
      if (sizeColumn && headers.includes(sizeColumn)) {
        const size = toNumber(row[sizeColumn]);
        if (isFinite(size) && size > 0) {
          point.size = size;
        }
      }
        
      return point;
    }).filter(Boolean);
    
    return points.length > 0 ? [{
      id: 'data',
      data: points
    }] : [];
  }
  
  // Group by series
  const seriesMap: Record<string, any[]> = {};
  
  data.forEach(row => {
    const series = cleanString(row[seriesColumn]) || 'default';
    const x = toNumber(row[xColumn]);
    const y = toNumber(row[yColumn]);
    
    if (!isFinite(x) || !isFinite(y)) return;
    
    if (!seriesMap[series]) {
      seriesMap[series] = [];
    }
    
    const point: any = { x, y };
    
    if (sizeColumn && headers.includes(sizeColumn)) {
      const size = toNumber(row[sizeColumn]);
      if (isFinite(size) && size > 0) {
        point.size = size;
      }
    }
    
    seriesMap[series].push(point);
  });
  
  return Object.entries(seriesMap)
    .filter(([, points]) => points.length > 0)
    .map(([seriesName, points]) => ({
      id: seriesName,
      data: points
    }));
}

// Utility function to get required columns for scatter plot
export function getRequiredColumns(config: ScatterPlotConfig): string[] {
  const columns: string[] = [];
  
  if (config.dataMapping.seriesColumn) {
    columns.push(config.dataMapping.seriesColumn);
  }
  columns.push(config.dataMapping.xColumn);
  columns.push(config.dataMapping.yColumn);
  if (config.dataMapping.sizeColumn) {
    columns.push(config.dataMapping.sizeColumn);
  }
  
  return columns;
}

// Utility function to validate if CSV has required columns
export function validateCsvForScatter(csvData: string, config: ScatterPlotConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 