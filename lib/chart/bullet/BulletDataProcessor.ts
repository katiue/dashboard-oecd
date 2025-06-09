import type { BulletChartConfig } from './BulletSchema';

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

// Bullet Chart Data Processor
export function processBulletData(csvData: string, config: BulletChartConfig): any[] {
  const { headers, data } = parseCSV(csvData);
  const { idColumn, actualColumn, targetColumn, rangeColumns } = config.dataMapping;
  
  if (!data.length || !headers.includes(idColumn) || !headers.includes(actualColumn)) return [];
  
  return data.map((row, index) => {
    const bullet: any = {
      id: cleanString(row[idColumn]) || `metric-${index}`,
      measures: [toNumber(row[actualColumn])]
    };
    
    // Add target marker if column exists
    if (targetColumn && headers.includes(targetColumn)) {
      const target = toNumber(row[targetColumn]);
      if (target > 0) {
        bullet.markers = [target];
      }
    }
    
    // Add qualitative ranges if columns exist
    if (rangeColumns && rangeColumns.length > 0) {
      const ranges: number[] = [];
      rangeColumns.forEach(col => {
        if (headers.includes(col)) {
          const value = toNumber(row[col]);
          if (value > 0) {
            ranges.push(value);
          }
        }
      });
      if (ranges.length > 0) {
        bullet.ranges = ranges;
      }
    }
    
    return bullet;
  }).filter(item => item.measures[0] > 0); // Only include items with positive actual values
}

// Get required columns for bullet chart
export function getRequiredColumns(config: BulletChartConfig): string[] {
  const columns = [config.dataMapping.idColumn, config.dataMapping.actualColumn];
  
  if (config.dataMapping.targetColumn) {
    columns.push(config.dataMapping.targetColumn);
  }
  
  if (config.dataMapping.rangeColumns) {
    columns.push(...config.dataMapping.rangeColumns);
  }
  
  return columns;
}

// Validate CSV for bullet chart
export function validateCsvForBullet(csvData: string, config: BulletChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 