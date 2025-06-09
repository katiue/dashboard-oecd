import { tool } from 'ai';
import { z } from 'zod';
import type { DataStreamWriter } from 'ai';

// Simple CSV processing utilities
function parseCSV(csvText: string): { headers: string[], data: Record<string, any>[] } {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      const numValue = parseFloat(value);
      row[header] = isNaN(numValue) ? value : numValue;
    });
    return row;
  });
  return { headers, data };
}

function dataToCSV(headers: string[], data: Record<string, any>[]): string {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',')
  );
  return [csvHeaders, ...csvRows].join('\n');
}

// Tool 1: Load Data (simplified)
export const loadData = tool({
  description: 'Load and parse CSV data from text input.',
  parameters: z.object({
    csvText: z.string().describe('CSV data as text'),
  }),
  execute: async ({ csvText }) => {
    console.log('🔧 loadData tool called with:', { 
      textLength: csvText?.length,
      textType: typeof csvText
    });
    try {
      const { headers, data } = parseCSV(csvText);
      
      const result = {
        success: true,
        message: `Loaded ${data.length} rows with ${headers.length} columns`,
        headers: headers.join(', '),
        rowCount: data.length,
        columnCount: headers.length
      };
      console.log('✅ loadData result:', { 
        success: result.success, 
        dataLength: data.length, 
        headersLength: headers.length,
        message: result.message 
      });
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ loadData error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 2: Clean Data (simplified) 
export const cleanData = tool({
  description: 'Basic data cleaning - remove null values and duplicates.',
  parameters: z.object({
    data: z.any().describe('Data rows to clean (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    removeNulls: z.boolean().default(true).describe('Remove rows with null values'),
    removeDuplicates: z.boolean().default(false).describe('Remove duplicate rows'),
  }),
  execute: async ({ data, headers, removeNulls, removeDuplicates }) => {
    console.log('🔧 cleanData tool called with:', { 
      dataLength: data?.length, 
      headersLength: headers?.length, 
      removeNulls, 
      removeDuplicates,
      dataType: typeof data,
      headersType: typeof headers
    });
    try {
      let cleaned = [...data];
      const operations: string[] = [];
      
      if (removeNulls) {
        const before = cleaned.length;
        cleaned = cleaned.filter(row => 
          headers.every(h => (row as any)[h] !== null && (row as any)[h] !== undefined && (row as any)[h] !== '')
        );
        operations.push(`Removed ${before - cleaned.length} null rows`);
      }
      
      if (removeDuplicates) {
        const before = cleaned.length;
        const seen = new Set();
        cleaned = cleaned.filter(row => {
          const key = JSON.stringify(row);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        operations.push(`Removed ${before - cleaned.length} duplicates`);
      }
      
      const result = {
        success: true,
        message: `Cleaned data: ${operations.join(', ')}. Result: ${cleaned.length} rows`,
        rowCount: cleaned.length,
        operations: operations.join(', ')
      };
      console.log('✅ cleanData result:', { 
        success: result.success, 
        cleanedDataLength: cleaned.length,
        operations: result.operations,
        message: result.message 
      });
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ cleanData error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 3: Filter Data (simplified)
export const filterData = tool({
  description: 'Filter data with simple conditions.',
  parameters: z.object({
    data: z.any().describe('Data rows to filter (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    column: z.string().describe('Column to filter on'),
    operator: z.enum(['>', '<', '==', '!=']).describe('Filter operator'),
    value: z.string().describe('Filter value (will be converted to appropriate type)'),
  }),
  execute: async ({ data, headers, column, operator, value }) => {
    console.log('🔧 filterData tool called with:', { 
      dataLength: data?.length, 
      headersLength: headers?.length, 
      column, 
      operator, 
      value,
      valueType: typeof value
    });
    try {
      const originalCount = data.length;
      
      const filtered = data.filter((row: any) => {
        const cellValue = row[column];
        // Convert value to appropriate type for comparison
        const numericValue = parseFloat(value);
        const compareValue = isNaN(numericValue) ? value : numericValue;
        
        switch (operator) {
          case '>': return Number(cellValue) > Number(compareValue);
          case '<': return Number(cellValue) < Number(compareValue);
          case '==': return cellValue == compareValue;
          case '!=': return cellValue != compareValue;
          default: return true;
        }
      });
      
      const result = {
        success: true,
        message: `Filtered ${originalCount} → ${filtered.length} rows using ${column} ${operator} ${value}`,
        originalCount,
        filteredCount: filtered.length,
        filter: `${column} ${operator} ${value}`
      };
      console.log('✅ filterData result:', result);
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ filterData error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 4: Aggregate Data (simplified)
export const aggregateData = tool({
  description: 'Simple data aggregation by grouping.',
  parameters: z.object({
    data: z.any().describe('Data rows to aggregate (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    groupBy: z.string().describe('Column to group by'),
    valueColumn: z.string().describe('Column to aggregate'),
    operation: z.enum(['sum', 'mean', 'count']).describe('Aggregation operation'),
  }),
  execute: async ({ data, headers, groupBy, valueColumn, operation }) => {
    console.log('🔧 aggregateData tool called with:', { 
      dataLength: data?.length, 
      headersLength: headers?.length, 
      groupBy, 
      valueColumn, 
      operation
    });
    try {
      const groups: Record<string, any[]> = {};
      
      // Group the data
      data.forEach((row: any) => {
        const key = String(row[groupBy]);
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      });
      
      // Aggregate each group
      const result = Object.entries(groups).map(([key, rows]) => {
        let value: number;
        const values = rows.map(r => Number((r as any)[valueColumn])).filter(v => !isNaN(v));
        
        switch (operation) {
          case 'sum': value = values.reduce((a, b) => a + b, 0); break;
          case 'mean': value = values.reduce((a, b) => a + b, 0) / values.length; break;
          case 'count': value = rows.length; break;
          default: value = 0;
        }
        
        return { [groupBy]: key, [valueColumn]: value };
      });
      
      const finalResult = {
        success: true,
        message: `Aggregated ${data.length} rows into ${Object.keys(groups).length} groups by ${groupBy}`,
        groupCount: Object.keys(groups).length,
        operation: `${operation} of ${valueColumn} grouped by ${groupBy}`
      };
      console.log('✅ aggregateData result:', finalResult);
      return finalResult;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ aggregateData error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 5: Transform Data (simplified)
export const transformData = tool({
  description: 'Simple data transformations.',
  parameters: z.object({
    data: z.any().describe('Data rows to transform (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    operation: z.enum(['normalize', 'round']).describe('Transform operation'),
    column: z.string().describe('Column to transform'),
  }),
  execute: async ({ data, headers, operation, column }) => {
    try {
      const transformed = data.map((row: any) => {
        const newRow = { ...row };
        const value = Number(row[column]);
        
        if (!isNaN(value)) {
          switch (operation) {
            case 'normalize':
              // Simple 0-1 normalization
              const values = data.map((r: any) => Number(r[column])).filter((v: any) => !isNaN(v));
              const min = Math.min(...values);
              const max = Math.max(...values);
              (newRow as any)[column] = (value - min) / (max - min);
              break;
            case 'round':
              (newRow as any)[column] = Math.round(value);
              break;
          }
        }
        
        return newRow;
      });
      
      const result = {
        success: true,
        message: `Transformed column ${column} using ${operation} on ${data.length} rows`,
        operation: `${operation} on ${column}`,
        rowCount: data.length
      };
      console.log('✅ transformData result:', result);
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ transformData error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 6: Analyze Stats (simplified)
export const analyzeStats = tool({
  description: 'Basic statistical analysis.',
  parameters: z.object({
    data: z.any().describe('Data rows to analyze (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    column: z.string().describe('Column to analyze'),
  }),
  execute: async ({ data, headers, column }) => {
    try {
      const values = data.map((row: any) => Number((row as any)[column])).filter((v: number) => !isNaN(v));
      
      if (values.length === 0) {
        return {
          success: false,
          error: `No numeric values found in column ${column}`
        };
      }
      
      const sum = values.reduce((a: number, b: number) => a + b, 0);
      const mean = sum / values.length;
      const sortedValues = [...values].sort((a, b) => a - b);
      const median = sortedValues[Math.floor(values.length / 2)];
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      const result = {
        success: true,
        message: `Analyzed ${values.length} values in ${column}. Mean: ${Math.round(mean * 100) / 100}, Min: ${min}, Max: ${max}`,
        column,
        count: values.length,
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        min,
        max
      };
      console.log('✅ analyzeStats result:', result);
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ analyzeStats error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 7: Export Data (simplified)
export const exportProcessedData = tool({
  description: 'Export data to CSV format.',
  parameters: z.object({
    data: z.any().describe('Data rows to export (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    filename: z.string().default('exported_data').describe('Export filename'),
  }),
  execute: async ({ data, headers, filename }) => {
    try {
      const csvData = dataToCSV(headers, data as any[]);
      
      const result = {
        success: true,
        message: `Exported ${data.length} rows to CSV format as ${filename}.csv (${csvData.length} bytes)`,
        filename: `${filename}.csv`,
        size: csvData.length,
        rows: data.length
      };
      console.log('✅ exportProcessedData result:', result);
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ exportProcessedData error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 8: Calculate Statistics for Visualization
export const calculateStatistics = tool({
  description: 'Calculate comprehensive statistics for numeric columns to help with data analysis and visualization.',
  parameters: z.object({
    data: z.any().describe('Data rows to analyze (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    columns: z.array(z.string()).optional().describe('Specific columns to analyze (if not provided, analyzes all numeric columns)'),
  }),
  execute: async ({ data, headers, columns }) => {
    try {
      const analyzeColumns = columns || headers.filter(h => {
        const values = (data as any[]).map((row: any) => row[h]).filter((v: any) => v !== null && v !== undefined);
        return values.length > 0 && !isNaN(Number(values[0]));
      });
      
      const statistics: Record<string, any> = {};
      
              analyzeColumns.forEach(column => {
          const values = (data as any[]).map((row: any) => Number(row[column])).filter((v: any) => !isNaN(v));
        
        if (values.length === 0) {
          statistics[column] = { error: 'No numeric values found' };
          return;
        }
        
        const sorted = [...values].sort((a: any, b: any) => a - b);
        const sum = values.reduce((a: any, b: any) => a + b, 0);
        const mean = sum / values.length;
        const median = sorted[Math.floor(values.length / 2)];
        const mode = (() => {
          const freq: Record<number, number> = {};
          values.forEach((v: any) => freq[v] = (freq[v] || 0) + 1);
          const maxFreq = Math.max(...Object.values(freq));
          return Object.keys(freq).find(k => freq[Number(k)] === maxFreq);
        })();
        
        // Calculate variance and standard deviation
        const variance = values.reduce((acc: any, val: any) => acc + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        // Calculate quartiles
        const q1 = sorted[Math.floor(values.length * 0.25)];
        const q3 = sorted[Math.floor(values.length * 0.75)];
        const iqr = q3 - q1;
        
        statistics[column] = {
          count: values.length,
          sum: Math.round(sum * 100) / 100,
          mean: Math.round(mean * 100) / 100,
          median: Math.round(median * 100) / 100,
          mode: mode ? Number(mode) : null,
          min: Math.min(...values),
          max: Math.max(...values),
          range: Math.max(...values) - Math.min(...values),
          stdDev: Math.round(stdDev * 100) / 100,
          variance: Math.round(variance * 100) / 100,
          q1: Math.round(q1 * 100) / 100,
          q3: Math.round(q3 * 100) / 100,
          iqr: Math.round(iqr * 100) / 100,
        };
      });
      
      const result = {
        success: true,
        message: `Calculated statistics for ${analyzeColumns.length} numeric columns`,
        statistics,
        analyzedColumns: analyzeColumns,
        totalRows: (data as any[]).length
      };
      console.log('✅ calculateStatistics result:', result);
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ calculateStatistics error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 9: Sort Data
export const sortData = tool({
  description: 'Sort data by specified column with ascending or descending order. This can help reorder data for better visualization.',
  parameters: z.object({
    data: z.any().describe('Data rows to sort (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    sortBy: z.string().describe('Column name to sort by'),
    sortOrder: z.enum(['asc', 'desc']).default('asc').describe('Sort order: ascending or descending'),
  }),
  execute: async ({ data, headers, sortBy, sortOrder }) => {
    try {
      if (!headers.includes(sortBy)) {
        return {
          success: false,
          error: `Column '${sortBy}' not found. Available columns: ${headers.join(', ')}`
        };
      }
      
      const sortedData = [...(data as any[])].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        // Handle different data types
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        } else {
          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          if (sortOrder === 'desc') {
            return bStr.localeCompare(aStr);
          } else {
            return aStr.localeCompare(bStr);
          }
        }
      });
      
      const result = {
        success: true,
        message: `Sorted ${sortedData.length} rows by ${sortBy} (${sortOrder})`,
        sortedData,
        sortBy,
        sortOrder,
        rowCount: sortedData.length
      };
      console.log('✅ sortData result:', { 
        success: result.success, 
        sortBy: result.sortBy, 
        sortOrder: result.sortOrder,
        rowCount: result.rowCount 
      });
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ sortData error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 10: Group and Aggregate with Statistics
export const groupAndAggregate = tool({
  description: 'Group data by column and calculate multiple statistics (sum, mean, count, min, max) for visualization.',
  parameters: z.object({
    data: z.any().describe('Data rows to group and aggregate (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    groupBy: z.string().describe('Column to group by'),
    valueColumn: z.string().describe('Column to calculate statistics for'),
    operations: z.array(z.enum(['sum', 'mean', 'count', 'min', 'max', 'median'])).default(['sum', 'count']).describe('Statistics to calculate'),
  }),
  execute: async ({ data, headers, groupBy, valueColumn, operations }) => {
    try {
      if (!headers.includes(groupBy)) {
        return {
          success: false,
          error: `Group column '${groupBy}' not found. Available columns: ${headers.join(', ')}`
        };
      }
      
      if (!headers.includes(valueColumn)) {
        return {
          success: false,
          error: `Value column '${valueColumn}' not found. Available columns: ${headers.join(', ')}`
        };
      }
      
      const groups: Record<string, any[]> = {};
      
      // Group the data
      (data as any[]).forEach(row => {
        const key = String(row[groupBy]);
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      });
      
      // Calculate statistics for each group
      const results = Object.entries(groups).map(([key, rows]) => {
        const values = rows.map(r => Number(r[valueColumn])).filter(v => !isNaN(v));
        const result: any = { [groupBy]: key };
        
        operations.forEach(op => {
          switch (op) {
            case 'sum':
              result[`${valueColumn}_sum`] = values.reduce((a, b) => a + b, 0);
              break;
            case 'mean':
              result[`${valueColumn}_mean`] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
              break;
            case 'count':
              result[`${valueColumn}_count`] = rows.length;
              break;
            case 'min':
              result[`${valueColumn}_min`] = values.length > 0 ? Math.min(...values) : 0;
              break;
            case 'max':
              result[`${valueColumn}_max`] = values.length > 0 ? Math.max(...values) : 0;
              break;
            case 'median':
              const sorted = [...values].sort((a, b) => a - b);
              result[`${valueColumn}_median`] = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
              break;
          }
        });
        
        return result;
      });
      
      const finalResult = {
        success: true,
        message: `Grouped ${(data as any[]).length} rows into ${Object.keys(groups).length} groups by ${groupBy}`,
        groupedData: results,
        groupCount: Object.keys(groups).length,
        operations: operations.join(', '),
        groupBy,
        valueColumn
      };
      console.log('✅ groupAndAggregate result:', finalResult);
      return finalResult;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ groupAndAggregate error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 11: Sum Entire Column
export const sumEntireColumn = tool({
  description: 'Calculate the sum of all numeric values in a specific column of the dataset.',
  parameters: z.object({
    data: z.any().describe('Data rows to sum (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    column: z.string().describe('Column name to sum'),
  }),
  execute: async ({ data, headers, column }) => {
    console.log('🔧 sumEntireColumn tool called with:', { 
      dataLength: data?.length, 
      headersLength: headers?.length, 
      column
    });
    try {
      if (!headers.includes(column)) {
        return {
          success: false,
          error: `Column '${column}' not found. Available columns: ${headers.join(', ')}`
        };
      }
      
      const values = (data as any[]).map((row: any) => Number(row[column])).filter((v: number) => !isNaN(v));
      
      if (values.length === 0) {
        return {
          success: false,
          error: `No numeric values found in column '${column}'`
        };
      }
      
      const sum = values.reduce((a: number, b: number) => a + b, 0);
      const count = values.length;
      const totalRows = (data as any[]).length;
      
      const result = {
        success: true,
        message: `Sum of column '${column}': ${sum} (${count} numeric values out of ${totalRows} total rows)`,
        column,
        sum: Math.round(sum * 100) / 100,
        count,
        totalRows,
        average: Math.round((sum / count) * 100) / 100
      };
      console.log('✅ sumEntireColumn result:', result);
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ sumEntireColumn error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 12: Detect and Resolve Duplicates
export const detectAndResolveDuplicates = tool({
  description: 'Detect duplicate entries in a dataset and automatically aggregate them by summing numeric columns. This is essential when data has duplicate identifiers that need to be consolidated before visualization.',
  parameters: z.object({
    data: z.any().describe('Data rows to analyze for duplicates (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    identifierColumn: z.string().describe('Column to check for duplicates (e.g., car_name, product_id)'),
    numericColumns: z.array(z.string()).optional().describe('Specific numeric columns to sum (if not provided, will auto-detect)'),
    threshold: z.number().default(0.1).describe('Duplicate threshold (0.1 = 10% duplicates triggers aggregation)'),
  }),
  execute: async ({ data, headers, identifierColumn, numericColumns, threshold = 0.1 }) => {
    console.log('🔧 detectAndResolveDuplicates tool called with:', { 
      dataLength: data?.length, 
      identifierColumn, 
      threshold,
      numericColumnsProvided: numericColumns?.length || 0
    });
    
    try {
      if (!headers.includes(identifierColumn)) {
        return {
          success: false,
          error: `Identifier column '${identifierColumn}' not found. Available columns: ${headers.join(', ')}`
        };
      }
      
      const dataArray = data as any[];
      
      // Count duplicates
      const identifierCounts: Record<string, number> = {};
      dataArray.forEach(row => {
        const id = String(row[identifierColumn]);
        identifierCounts[id] = (identifierCounts[id] || 0) + 1;
      });
      
      const totalEntries = dataArray.length;
      const uniqueEntries = Object.keys(identifierCounts).length;
      const duplicateEntries = totalEntries - uniqueEntries;
      const duplicatePercentage = (duplicateEntries / totalEntries) * 100;
      
      console.log(`📊 Duplicate analysis: ${duplicatePercentage.toFixed(1)}% duplicates (${duplicateEntries}/${totalEntries})`);
      
      // If duplicate percentage is below threshold, return original data
      if (duplicatePercentage < threshold * 100) {
        return {
          success: true,
          message: `Low duplicate rate (${duplicatePercentage.toFixed(1)}%). No aggregation needed.`,
          duplicatePercentage: Math.round(duplicatePercentage * 10) / 10,
          originalData: dataArray,
          aggregatedData: dataArray,
          duplicatesResolved: false,
          totalRows: totalEntries,
          uniqueIdentifiers: uniqueEntries
        };
      }
      
      // Auto-detect numeric columns if not provided
      let columnsToSum = numericColumns;
      if (!columnsToSum || columnsToSum.length === 0) {
        columnsToSum = headers.filter(header => {
          if (header === identifierColumn) return false;
          const values = dataArray.map(row => row[header]).filter(v => v !== null && v !== undefined);
          if (values.length === 0) return false;
          const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
          return numericValues.length > values.length * 0.8; // 80% numeric
        });
      }
      
      console.log(`🔢 Columns to sum: ${columnsToSum.join(', ')}`);
      
      // Group and aggregate data
      const groups: Record<string, any[]> = {};
      dataArray.forEach(row => {
        const id = String(row[identifierColumn]);
        if (!groups[id]) groups[id] = [];
        groups[id].push(row);
      });
      
      // Create aggregated data
      const aggregatedData = Object.entries(groups).map(([id, rows]) => {
        const aggregatedRow: any = { [identifierColumn]: id };
        
        // For non-numeric columns, take the first value
        headers.forEach(header => {
          if (header === identifierColumn) return;
          
          if (columnsToSum.includes(header)) {
            // Sum numeric columns
            const values = rows.map(r => Number(r[header])).filter(v => !isNaN(v));
            aggregatedRow[header] = values.reduce((a, b) => a + b, 0);
          } else {
            // Take first non-null value for other columns
            const firstValue = rows.find(r => r[header] !== null && r[header] !== undefined)?.[header];
            aggregatedRow[header] = firstValue || '';
          }
        });
        
        return aggregatedRow;
      });
      
      const result = {
        success: true,
        message: `HIGH DUPLICATE WARNING: ${duplicatePercentage.toFixed(1)}% of ${identifierColumn} values are duplicates. Aggregated ${totalEntries} rows into ${aggregatedData.length} unique entries by summing: ${columnsToSum.join(', ')}`,
        duplicatePercentage: Math.round(duplicatePercentage * 10) / 10,
        originalData: dataArray,
        aggregatedData,
        duplicatesResolved: true,
        totalRows: totalEntries,
        uniqueIdentifiers: aggregatedData.length,
        summedColumns: columnsToSum,
        duplicateDetails: Object.entries(identifierCounts).filter(([_, count]) => count > 1).map(([id, count]) => ({ id, count }))
      };
      
      console.log('✅ detectAndResolveDuplicates result:', {
        success: result.success,
        duplicatePercentage: result.duplicatePercentage,
        originalRows: result.totalRows,
        aggregatedRows: result.uniqueIdentifiers,
        duplicatesResolved: result.duplicatesResolved
      });
      
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ detectAndResolveDuplicates error:', errorResult);
      return errorResult;
    }
  }
});

// ============================================================================
// OECD PATENT DATA SPECIALIZED TOOLS
// ============================================================================

// Tool 16: Load and Validate OECD Patent Data
export const loadOECDPatentData = tool({
  description: 'Load and validate OECD patent data with comprehensive quality assessment and preprocessing capabilities.',
  parameters: z.object({
    csvUrl: z.string().describe('URL to the OECD patent CSV data source'),
    validateStructure: z.boolean().default(true).describe('Validate expected OECD patent data structure'),
    assessQuality: z.boolean().default(true).describe('Perform comprehensive data quality assessment'),
    removeInvalidRecords: z.boolean().default(true).describe('Remove records with critical missing values'),
  }),
  execute: async ({ csvUrl, validateStructure, assessQuality, removeInvalidRecords }) => {
    console.log('🔧 loadOECDPatentData called with:', { csvUrl, validateStructure, assessQuality, removeInvalidRecords });
    
    try {
      // Fetch CSV data
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch OECD patent data: ${response.statusText}`);
      }
      
      const csvData = await response.text();
      const { headers, data } = parseCSV(csvData);
      
      const results: any = {
        success: true,
        originalRows: data.length,
        headers: headers.join(', '),
        columnCount: headers.length
      };
      
      // Expected OECD patent data columns (common patterns)
      const expectedPatentColumns = [
        'country', 'year', 'patent_applications', 'patent_grants', 'inventor_count',
        'technology_field', 'priority_year', 'application_year', 'publication_year',
        'patent_families', 'triadic_patents', 'pct_applications'
      ];
      
      let qualityIssues: string[] = [];
      let processedData = [...data];
      
      // Structure validation
      if (validateStructure) {
        const foundColumns = expectedPatentColumns.filter(col => 
          headers.some(h => h.toLowerCase().includes(col.toLowerCase()))
        );
        
        results.structureValidation = {
          expectedColumns: expectedPatentColumns.length,
          foundColumns: foundColumns.length,
          missingColumns: expectedPatentColumns.filter(col => 
            !headers.some(h => h.toLowerCase().includes(col.toLowerCase()))
          ),
          identifiedColumns: foundColumns
        };
        
        if (foundColumns.length < 3) {
          qualityIssues.push(`LOW STRUCTURE MATCH: Only ${foundColumns.length} expected patent columns found`);
        }
      }
      
      // Data quality assessment
      if (assessQuality) {
        const qualityReport: any = {};
        
        headers.forEach(header => {
          const values = processedData.map(row => row[header]);
          const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
          const numericValues = nonNullValues.map(v => Number(v)).filter(v => !isNaN(v));
          
          qualityReport[header] = {
            totalValues: values.length,
            nullCount: values.length - nonNullValues.length,
            nullPercentage: Math.round(((values.length - nonNullValues.length) / values.length) * 100),
            isNumeric: numericValues.length > nonNullValues.length * 0.8,
            uniqueValues: new Set(nonNullValues).size,
            duplicatePercentage: Math.round((1 - (new Set(nonNullValues).size / nonNullValues.length)) * 100)
          };
          
          // Identify quality issues
          if (qualityReport[header].nullPercentage > 20) {
            qualityIssues.push(`${header}: ${qualityReport[header].nullPercentage}% missing values`);
          }
          if (qualityReport[header].duplicatePercentage > 50 && qualityReport[header].uniqueValues > 10) {
            qualityIssues.push(`${header}: ${qualityReport[header].duplicatePercentage}% duplicates`);
          }
        });
        
        results.qualityAssessment = qualityReport;
      }
      
      // Remove invalid records if requested
      if (removeInvalidRecords) {
        const beforeCount = processedData.length;
        
        // Remove rows where critical patent fields are missing
        const criticalFields = headers.filter(h => 
          h.toLowerCase().includes('country') || 
          h.toLowerCase().includes('year') ||
          h.toLowerCase().includes('patent')
        );
        
        processedData = processedData.filter(row => {
          return criticalFields.some(field => 
            row[field] !== null && row[field] !== undefined && row[field] !== ''
          );
        });
        
        const removedCount = beforeCount - processedData.length;
        if (removedCount > 0) {
          results.invalidRecordsRemoved = removedCount;
          qualityIssues.push(`Removed ${removedCount} records with missing critical fields`);
        }
      }
      
      results.finalRows = processedData.length;
      results.qualityIssues = qualityIssues;
      results.processedData = processedData;
      results.message = `📊 **OECD Patent Data Loaded Successfully!**\n\n**Dataset Overview:**\n• ${processedData.length} patent records\n• ${headers.length} data fields\n• Data quality: ${qualityIssues.length} issues identified\n\n**Quality Issues:**\n${qualityIssues.map(issue => `• ${issue}`).join('\n') || '• No major issues detected'}\n\n🔬 **Ready for Patent Analysis:** Data is prepared for country comparisons, technology field analysis, and temporal trends.`;
      
      console.log('✅ loadOECDPatentData success:', {
        originalRows: results.originalRows,
        finalRows: results.finalRows,
        qualityIssues: qualityIssues.length
      });
      
      return results;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ loadOECDPatentData error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 17: Clean and Standardize OECD Patent Data
export const cleanOECDPatentData = tool({
  description: 'Clean and standardize OECD patent data with specialized handling for patent-specific fields and formats.',
  parameters: z.object({
    data: z.any().describe('OECD patent data to clean (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    standardizeCountries: z.boolean().default(true).describe('Standardize country names and codes'),
    validateYears: z.boolean().default(true).describe('Validate and standardize year fields'),
    handleMissingPatentCounts: z.enum(['zero', 'interpolate', 'remove']).default('zero').describe('How to handle missing patent counts'),
    normalizeFields: z.boolean().default(true).describe('Normalize technology fields and categories'),
  }),
  execute: async ({ data, headers, standardizeCountries, validateYears, handleMissingPatentCounts, normalizeFields }) => {
    console.log('🔧 cleanOECDPatentData called with:', { 
      dataLength: data?.length, 
      headersLength: headers?.length,
      standardizeCountries,
      validateYears,
      handleMissingPatentCounts,
      normalizeFields
    });
    
    try {
      let cleanedData = [...data];
      const operations: string[] = [`Started with ${data.length} patent records`];
      
      // Country standardization
      if (standardizeCountries) {
        const countryMappings: Record<string, string> = {
          'US': 'United States', 'USA': 'United States', 'United States of America': 'United States',
          'UK': 'United Kingdom', 'GB': 'United Kingdom', 'Great Britain': 'United Kingdom',
          'DE': 'Germany', 'DEU': 'Germany', 'Deutschland': 'Germany',
          'JP': 'Japan', 'JPN': 'Japan',
          'CN': 'China', 'CHN': 'China', 'PRC': 'China',
          'FR': 'France', 'FRA': 'France',
          'IT': 'Italy', 'ITA': 'Italy',
          'KR': 'South Korea', 'KOR': 'South Korea', 'Korea': 'South Korea',
          'CA': 'Canada', 'CAN': 'Canada',
          'AU': 'Australia', 'AUS': 'Australia',
          'BR': 'Brazil', 'BRA': 'Brazil',
          'IN': 'India', 'IND': 'India',
          'RU': 'Russia', 'RUS': 'Russia', 'Russian Federation': 'Russia'
        };
        
        const countryColumns = headers.filter(h => 
          h.toLowerCase().includes('country') || h.toLowerCase().includes('nation')
        );
        
        if (countryColumns.length > 0) {
          let standardizedCount = 0;
          cleanedData = cleanedData.map(row => {
            const newRow = { ...row };
            countryColumns.forEach(col => {
              const original = String(row[col]).trim();
              const standardized = countryMappings[original] || original;
              if (standardized !== original) {
                standardizedCount++;
              }
              newRow[col] = standardized;
            });
            return newRow;
          });
          operations.push(`Standardized ${standardizedCount} country names`);
        }
      }
      
      // Year validation and standardization
      if (validateYears) {
        const yearColumns = headers.filter(h => 
          h.toLowerCase().includes('year') || h.toLowerCase().includes('date')
        );
        
        if (yearColumns.length > 0) {
          let correctedYears = 0;
          cleanedData = cleanedData.map(row => {
            const newRow = { ...row };
            yearColumns.forEach(col => {
              const yearValue = row[col];
              if (yearValue) {
                const year = parseInt(String(yearValue));
                if (!isNaN(year)) {
                  // Valid year range for patent data (1980-2030)
                  if (year >= 1980 && year <= 2030) {
                    newRow[col] = year;
                  } else if (year > 30 && year < 100) {
                    // Convert 2-digit years
                    newRow[col] = year < 50 ? 2000 + year : 1900 + year;
                    correctedYears++;
                  } else {
                    newRow[col] = null; // Invalid year
                  }
                }
              }
            });
            return newRow;
          });
          operations.push(`Validated and corrected ${correctedYears} year values`);
        }
      }
      
      // Handle missing patent counts
      const patentCountColumns = headers.filter(h => 
        h.toLowerCase().includes('patent') && 
        (h.toLowerCase().includes('count') || h.toLowerCase().includes('application') || h.toLowerCase().includes('grant'))
      );
      
      if (patentCountColumns.length > 0) {
        let handledMissing = 0;
        cleanedData = cleanedData.map((row, index) => {
          const newRow = { ...row };
          patentCountColumns.forEach(col => {
            const value = row[col];
            if (value === null || value === undefined || value === '') {
              handledMissing++;
              switch (handleMissingPatentCounts) {
                case 'zero':
                  newRow[col] = 0;
                  break;
                case 'interpolate':
                  // Simple interpolation based on nearby values
                  const prevValue = index > 0 ? cleanedData[index - 1][col] : 0;
                  const nextValue = index < cleanedData.length - 1 ? cleanedData[index + 1][col] : 0;
                  newRow[col] = Math.round((Number(prevValue) + Number(nextValue)) / 2) || 0;
                  break;
                case 'remove':
                  // Will be filtered out later
                  break;
              }
            } else {
              // Ensure numeric values
              const numValue = Number(value);
              newRow[col] = isNaN(numValue) ? 0 : Math.max(0, numValue);
            }
          });
          return newRow;
        });
        
        if (handleMissingPatentCounts === 'remove') {
          const beforeCount = cleanedData.length;
          cleanedData = cleanedData.filter(row => 
            patentCountColumns.some(col => row[col] !== null && row[col] !== undefined && row[col] !== '')
          );
          operations.push(`Removed ${beforeCount - cleanedData.length} records with missing patent counts`);
        } else {
          operations.push(`Handled ${handledMissing} missing patent count values`);
        }
      }
      
      // Normalize technology fields
      if (normalizeFields) {
        const techFieldColumns = headers.filter(h => 
          h.toLowerCase().includes('technology') || 
          h.toLowerCase().includes('field') || 
          h.toLowerCase().includes('sector') ||
          h.toLowerCase().includes('category')
        );
        
        if (techFieldColumns.length > 0) {
          let normalizedFields = 0;
          const fieldMappings: Record<string, string> = {
            'ICT': 'Information Technology',
            'IT': 'Information Technology',
            'AI': 'Artificial Intelligence',
            'ML': 'Machine Learning',
            'biotech': 'Biotechnology',
            'pharma': 'Pharmaceuticals',
            'medtech': 'Medical Technology',
            'cleantech': 'Clean Technology',
            'greentech': 'Green Technology',
            'nanotech': 'Nanotechnology'
          };
          
          cleanedData = cleanedData.map(row => {
            const newRow = { ...row };
            techFieldColumns.forEach(col => {
              const original = String(row[col] || '').trim();
              const normalized = fieldMappings[original] || 
                original.charAt(0).toUpperCase() + original.slice(1).toLowerCase();
              if (normalized !== original && original !== '') {
                normalizedFields++;
              }
              newRow[col] = normalized;
            });
            return newRow;
          });
          operations.push(`Normalized ${normalizedFields} technology field entries`);
        }
      }
      
      const result = {
        success: true,
        message: `🧹 **OECD Patent Data Cleaned Successfully!**\n\n📊 **Cleaning Operations:**\n${operations.map(op => `• ${op}`).join('\n')}\n\n**Final Dataset:** ${cleanedData.length} clean patent records\n\n🔬 **Ready for Analysis:** Data is standardized and prepared for country comparisons, technology trends, and temporal analysis.`,
        originalRows: data.length,
        cleanedRows: cleanedData.length,
        operations: operations.join(' → '),
        cleanedData
      };
      
      console.log('✅ cleanOECDPatentData success:', {
        originalRows: result.originalRows,
        cleanedRows: result.cleanedRows,
        operations: operations.length
      });
      
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ cleanOECDPatentData error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 18: Prepare OECD Patent Data for Visualization
export const preparePatentDataForVisualization = tool({
  description: 'Prepare OECD patent data for advanced visualizations with filtering, brushing/linking, and dynamic updates capabilities.',
  parameters: z.object({
    data: z.any().describe('Cleaned OECD patent data (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    analysisType: z.enum(['country_comparison', 'technology_trends', 'temporal_analysis', 'innovation_metrics']).describe('Type of analysis to prepare for'),
    enableFiltering: z.boolean().default(true).describe('Prepare data structure for filtering'),
    supportBrushing: z.boolean().default(true).describe('Enable brushing/linking between visualizations'),
    aggregationLevel: z.enum(['yearly', 'country', 'technology', 'custom']).default('yearly').describe('Primary aggregation level'),
    topN: z.number().optional().describe('Limit to top N entities (countries/technologies)'),
  }),
  execute: async ({ data, headers, analysisType, enableFiltering, supportBrushing, aggregationLevel, topN }) => {
    console.log('🔧 preparePatentDataForVisualization called with:', { 
      dataLength: data?.length,
      analysisType,
      enableFiltering,
      supportBrushing,
      aggregationLevel,
      topN
    });
    
    try {
      let preparedData = [...data];
      const visualizationConfig: any = {
        analysisType,
        aggregationLevel,
        supportedChartTypes: [],
        filterableFields: [],
        brushingFields: [],
        keyMetrics: []
      };
      
      // Identify key fields for each analysis type
      const countryColumns = headers.filter(h => h.toLowerCase().includes('country'));
      const yearColumns = headers.filter(h => h.toLowerCase().includes('year'));
      const patentColumns = headers.filter(h => 
        h.toLowerCase().includes('patent') && 
        (h.toLowerCase().includes('application') || h.toLowerCase().includes('grant') || h.toLowerCase().includes('count'))
      );
      const techColumns = headers.filter(h => 
        h.toLowerCase().includes('technology') || h.toLowerCase().includes('field')
      );
      
      // Configure based on analysis type
      switch (analysisType) {
        case 'country_comparison':
          visualizationConfig.supportedChartTypes = ['bar', 'scatter', 'radar', 'heatmap'];
          visualizationConfig.primaryDimension = countryColumns[0];
          visualizationConfig.keyMetrics = patentColumns.slice(0, 3);
          visualizationConfig.filterableFields = [...countryColumns, ...yearColumns];
          visualizationConfig.brushingFields = [...countryColumns, ...patentColumns];
          
          // Aggregate by country
          if (countryColumns.length > 0 && patentColumns.length > 0) {
            const countryAggregation: Record<string, any> = {};
            
            preparedData.forEach(row => {
              const country = row[countryColumns[0]];
              if (!countryAggregation[country]) {
                countryAggregation[country] = { [countryColumns[0]]: country };
                patentColumns.forEach(col => countryAggregation[country][col] = 0);
              }
              
              patentColumns.forEach(col => {
                const value = Number(row[col]) || 0;
                countryAggregation[country][col] += value;
              });
            });
            
            preparedData = Object.values(countryAggregation);
          }
          break;
          
        case 'technology_trends':
          visualizationConfig.supportedChartTypes = ['line', 'areaBump', 'scatter', 'sunburst'];
          visualizationConfig.primaryDimension = techColumns[0];
          visualizationConfig.temporalDimension = yearColumns[0];
          visualizationConfig.keyMetrics = patentColumns.slice(0, 2);
          visualizationConfig.filterableFields = [...techColumns, ...yearColumns, ...countryColumns];
          visualizationConfig.brushingFields = [...techColumns, ...yearColumns];
          break;
          
        case 'temporal_analysis':
          visualizationConfig.supportedChartTypes = ['line', 'bar', 'stream', 'calendar'];
          visualizationConfig.primaryDimension = yearColumns[0];
          visualizationConfig.keyMetrics = patentColumns;
          visualizationConfig.filterableFields = [...yearColumns, ...countryColumns];
          visualizationConfig.brushingFields = [...yearColumns, ...patentColumns];
          
          // Sort by year for temporal analysis
          if (yearColumns.length > 0) {
            preparedData.sort((a, b) => {
              const yearA = Number(a[yearColumns[0]]) || 0;
              const yearB = Number(b[yearColumns[0]]) || 0;
              return yearA - yearB;
            });
          }
          break;
          
        case 'innovation_metrics':
          visualizationConfig.supportedChartTypes = ['radar', 'scatter', 'boxplot', 'heatmap'];
          visualizationConfig.keyMetrics = [...patentColumns, ...headers.filter(h => 
            h.toLowerCase().includes('inventor') || h.toLowerCase().includes('citation')
          )];
          visualizationConfig.filterableFields = [...countryColumns, ...yearColumns, ...techColumns];
          visualizationConfig.brushingFields = visualizationConfig.keyMetrics;
          break;
      }
      
      // Apply top N filtering if specified
      if (topN && topN > 0 && visualizationConfig.primaryDimension) {
        const primaryDim = visualizationConfig.primaryDimension;
        const primaryMetric = visualizationConfig.keyMetrics[0];
        
        if (primaryMetric) {
          // Aggregate by primary dimension and sort by primary metric
          const aggregated: Record<string, any> = {};
          
          preparedData.forEach(row => {
            const key = row[primaryDim];
            if (!aggregated[key]) {
              aggregated[key] = { [primaryDim]: key, [primaryMetric]: 0 };
            }
            aggregated[key][primaryMetric] += Number(row[primaryMetric]) || 0;
          });
          
          const topEntities = Object.values(aggregated)
            .sort((a, b) => Number(b[primaryMetric]) - Number(a[primaryMetric]))
            .slice(0, topN)
            .map(item => item[primaryDim]);
          
          preparedData = preparedData.filter(row => topEntities.includes(row[primaryDim]));
          visualizationConfig.appliedFilters = [`Top ${topN} by ${primaryMetric}`];
        }
      }
      
      // Prepare filtering infrastructure
      if (enableFiltering) {
        visualizationConfig.filterOptions = {};
        visualizationConfig.filterableFields.forEach((field: string | number) => {
          const uniqueValues = [...new Set(preparedData.map(row => row[field]))].filter(v => v != null);
          visualizationConfig.filterOptions[field] = {
            type: typeof uniqueValues[0] === 'number' ? 'numeric' : 'categorical',
            values: uniqueValues.slice(0, 20), // Limit for performance
            range: typeof uniqueValues[0] === 'number' ? {
              min: Math.min(...uniqueValues as number[]),
              max: Math.max(...uniqueValues as number[])
            } : undefined
          };
        });
      }
      
      // Prepare brushing/linking metadata
      if (supportBrushing) {
        visualizationConfig.brushingConfig = {
          enabledFields: visualizationConfig.brushingFields,
          linkingStrategy: 'highlight', // or 'filter'
          brushTypes: ['rectangular', 'temporal']
        };
      }
      
      const result = {
        success: true,
        message: `📊 **Patent Data Prepared for ${analysisType.replace('_', ' ').toUpperCase()} Analysis!**\n\n🔍 **Visualization Ready:**\n• ${preparedData.length} records prepared\n• Supported charts: ${visualizationConfig.supportedChartTypes.join(', ')}\n• Key metrics: ${visualizationConfig.keyMetrics.join(', ')}\n• Filterable fields: ${visualizationConfig.filterableFields.length}\n\n🎛️ **Interactive Features:**\n• Filtering: ${enableFiltering ? 'Enabled' : 'Disabled'}\n• Brushing/Linking: ${supportBrushing ? 'Enabled' : 'Disabled'}\n• Dynamic Updates: Ready for real-time parameter changes\n\n📈 **Ready for Advanced Visualizations:** Country comparisons, technology trends, and temporal analysis with full interactivity.`,
        preparedData,
        visualizationConfig,
        dataLength: preparedData.length,
        analysisType,
        recommendedCharts: visualizationConfig.supportedChartTypes
      };
      
      console.log('✅ preparePatentDataForVisualization success:', {
        dataLength: result.dataLength,
        analysisType: result.analysisType,
        chartTypes: visualizationConfig.supportedChartTypes.length
      });
      
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ preparePatentDataForVisualization error:', errorResult);
      return errorResult;
    }
  }
});

// ============================================================================
// DASHBOARD-INTEGRATED TABULAR TOOLS
// ============================================================================

interface TabularToolsProps {
  dataStream: DataStreamWriter;
}

// Tool 13: Clean Data for Dashboard
export const cleanDataForDashboard = ({ dataStream }: TabularToolsProps) => tool({
  description: 'Clean data and update the dashboard data tab with the cleaned dataset. This tool removes null values, duplicates, and optionally filters data.',
  parameters: z.object({
    csvUrl: z.string().describe('URL to the CSV data source'),
    removeNulls: z.boolean().default(true).describe('Remove rows with null/empty values'),
    removeDuplicates: z.boolean().default(false).describe('Remove completely duplicate rows'),
    filterColumn: z.string().optional().describe('Optional: Column to filter on'),
    filterOperator: z.enum(['>', '<', '==', '!=']).optional().describe('Filter operator'),
    filterValue: z.string().optional().describe('Filter value'),
    title: z.string().default('Cleaned Data').describe('Title for the cleaned dataset'),
  }),
  execute: async ({ csvUrl, removeNulls, removeDuplicates, filterColumn, filterOperator, filterValue, title }) => {
    console.log('🔧 cleanDataForDashboard called with:', { 
      csvUrl, removeNulls, removeDuplicates, filterColumn, filterOperator, filterValue, title
    });
    
    try {
      // Fetch and parse CSV data
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }
      
      const csvData = await response.text();
      const { headers, data } = parseCSV(csvData);
      
      let processedData = [...data];
      const operations: string[] = [`Loaded ${data.length} rows from source`];
      
      // Remove null values
      if (removeNulls) {
        const before = processedData.length;
        processedData = processedData.filter(row => 
          headers.every(h => row[h] !== null && row[h] !== undefined && row[h] !== '')
        );
        const removed = before - processedData.length;
        if (removed > 0) {
          operations.push(`Removed ${removed} rows with null/empty values`);
        }
      }
      
      // Remove duplicates
      if (removeDuplicates) {
        const before = processedData.length;
        const seen = new Set();
        processedData = processedData.filter(row => {
          const key = JSON.stringify(row);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const removed = before - processedData.length;
        if (removed > 0) {
          operations.push(`Removed ${removed} duplicate rows`);
        }
      }
      
      // Apply filter if specified
      if (filterColumn && filterOperator && filterValue && headers.includes(filterColumn)) {
        const before = processedData.length;
        processedData = processedData.filter(row => {
          const cellValue = row[filterColumn];
          const numericValue = parseFloat(filterValue);
          const compareValue = isNaN(numericValue) ? filterValue : numericValue;
          
          switch (filterOperator) {
            case '>': return Number(cellValue) > Number(compareValue);
            case '<': return Number(cellValue) < Number(compareValue);
            case '==': return cellValue == compareValue;
            case '!=': return cellValue != compareValue;
            default: return true;
          }
        });
        const remaining = processedData.length;
        operations.push(`Filtered by ${filterColumn} ${filterOperator} ${filterValue}: ${remaining} rows remaining`);
      }
      
      // Create processed CSV
      const processedCsv = dataToCSV(headers, processedData);
      
      // Send to dashboard data tab
      dataStream.writeData({
        type: 'data-update',
        content: {
          title,
          csvData: processedCsv,
          headers,
          rowCount: processedData.length,
          operations,
          source: csvUrl,
          action: 'clean'
        }
      });
      
      const result = {
        success: true,
        message: `✅ **Data Cleaned Successfully!**\n\n📊 **Processing Results:**\n${operations.map(op => `• ${op}`).join('\n')}\n\n**Final Dataset:** ${processedData.length} rows, ${headers.length} columns\n\n🔄 **Dashboard Updated:** The cleaned data is now available in the dashboard data tab.`,
        originalRows: data.length,
        cleanedRows: processedData.length,
        operations: operations.join(', '),
        headers: headers.join(', ')
      };
      
      console.log('✅ cleanDataForDashboard success:', result);
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ cleanDataForDashboard error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 14: Resolve Duplicates for Dashboard
export const resolveDuplicatesForDashboard = ({ dataStream }: TabularToolsProps) => tool({
  description: 'Detect and resolve duplicate entries by aggregating them, then update the dashboard data tab with the cleaned dataset.',
  parameters: z.object({
    csvUrl: z.string().describe('URL to the CSV data source'),
    identifierColumn: z.string().describe('Column to check for duplicates (e.g., car_name, product_id)'),
    numericColumns: z.array(z.string()).optional().describe('Specific numeric columns to sum (auto-detected if not provided)'),
    threshold: z.number().default(0.1).describe('Duplicate threshold (0.1 = 10% duplicates triggers aggregation)'),
    title: z.string().default('Deduplicated Data').describe('Title for the processed dataset'),
  }),
  execute: async ({ csvUrl, identifierColumn, numericColumns, threshold, title }) => {
    console.log('🔧 resolveDuplicatesForDashboard called with:', { 
      csvUrl, identifierColumn, numericColumns, threshold, title
    });
    
    try {
      // Fetch and parse CSV data
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }
      
      const csvData = await response.text();
      const { headers, data } = parseCSV(csvData);
      
      if (!headers.includes(identifierColumn)) {
        throw new Error(`Identifier column '${identifierColumn}' not found. Available columns: ${headers.join(', ')}`);
      }
      
      // Count duplicates
      const identifierCounts: Record<string, number> = {};
      data.forEach(row => {
        const id = String(row[identifierColumn]);
        identifierCounts[id] = (identifierCounts[id] || 0) + 1;
      });
      
      const totalEntries = data.length;
      const uniqueEntries = Object.keys(identifierCounts).length;
      const duplicateEntries = totalEntries - uniqueEntries;
      const duplicatePercentage = (duplicateEntries / totalEntries) * 100;
      
      const operations: string[] = [`Loaded ${totalEntries} rows from source`];
      operations.push(`Found ${duplicatePercentage.toFixed(1)}% duplicates in ${identifierColumn}`);
      
      let processedData = data;
      let duplicatesResolved = false;
      
      if (duplicatePercentage >= threshold * 100) {
        // Auto-detect numeric columns if not provided
        let columnsToSum = numericColumns;
        if (!columnsToSum || columnsToSum.length === 0) {
          columnsToSum = headers.filter(header => {
            if (header === identifierColumn) return false;
            const values = data.map(row => row[header]).filter(v => v !== null && v !== undefined);
            if (values.length === 0) return false;
            const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
            return numericValues.length > values.length * 0.8;
          });
        }
        
        operations.push(`Auto-detected numeric columns: ${columnsToSum.join(', ')}`);
        
        // Group and aggregate data
        const groups: Record<string, any[]> = {};
        data.forEach(row => {
          const id = String(row[identifierColumn]);
          if (!groups[id]) groups[id] = [];
          groups[id].push(row);
        });
        
        // Create aggregated data
        processedData = Object.entries(groups).map(([id, rows]) => {
          const aggregatedRow: any = { [identifierColumn]: id };
          
          headers.forEach(header => {
            if (header === identifierColumn) return;
            
            if (columnsToSum.includes(header)) {
              // Sum numeric columns
              const values = rows.map(r => Number(r[header])).filter(v => !isNaN(v));
              aggregatedRow[header] = values.reduce((a, b) => a + b, 0);
            } else {
              // Take first non-null value
              const firstValue = rows.find(r => r[header] !== null && r[header] !== undefined)?.[header];
              aggregatedRow[header] = firstValue || '';
            }
          });
          
          return aggregatedRow;
        });
        
        duplicatesResolved = true;
        operations.push(`Aggregated ${totalEntries} rows into ${processedData.length} unique entries`);
        operations.push(`Summed columns: ${columnsToSum.join(', ')}`);
      } else {
        operations.push(`Low duplicate rate - no aggregation needed`);
      }
      
      // Create processed CSV
      const processedCsv = dataToCSV(headers, processedData);
      
      // Send to dashboard data tab
      dataStream.writeData({
        type: 'data-update',
        content: {
          title,
          csvData: processedCsv,
          headers,
          rowCount: processedData.length,
          operations,
          source: csvUrl,
          action: 'deduplicate',
          duplicateInfo: {
            duplicatePercentage: Math.round(duplicatePercentage * 10) / 10,
            originalRows: totalEntries,
            finalRows: processedData.length,
            duplicatesResolved
          }
        }
      });
      
      const statusEmoji = duplicatesResolved ? '🔧' : '✅';
      const statusMessage = duplicatesResolved 
        ? `**HIGH DUPLICATE WARNING RESOLVED!** ${duplicatePercentage.toFixed(1)}% duplicates detected and aggregated.`
        : `**Data Quality Check Complete.** ${duplicatePercentage.toFixed(1)}% duplicates detected (below threshold).`;
      
      const result = {
        success: true,
        message: `${statusEmoji} **Duplicate Analysis Complete!**\n\n${statusMessage}\n\n📊 **Processing Results:**\n${operations.map(op => `• ${op}`).join('\n')}\n\n**Final Dataset:** ${processedData.length} rows, ${headers.length} columns\n\n🔄 **Dashboard Updated:** The processed data is now available in the dashboard data tab.`,
        duplicatePercentage: Math.round(duplicatePercentage * 10) / 10,
        originalRows: totalEntries,
        finalRows: processedData.length,
        duplicatesResolved,
        operations: operations.join(', ')
      };
      
      console.log('✅ resolveDuplicatesForDashboard success:', result);
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ resolveDuplicatesForDashboard error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 15: Advanced Data Processing for Dashboard
export const processDataForDashboard = ({ dataStream }: TabularToolsProps) => tool({
  description: 'Comprehensive data processing pipeline: load, clean, deduplicate, filter, sort, and analyze data for dashboard visualization.',
  parameters: z.object({
    csvUrl: z.string().describe('URL to the CSV data source'),
    identifierColumn: z.string().optional().describe('Column to check for duplicates'),
    removeNulls: z.boolean().default(true).describe('Remove rows with null values'),
    filterColumn: z.string().optional().describe('Column to filter on'),
    filterOperator: z.enum(['>', '<', '==', '!=']).optional().describe('Filter operator'),
    filterValue: z.string().optional().describe('Filter value'),
    sortBy: z.string().optional().describe('Column to sort by'),
    sortOrder: z.enum(['asc', 'desc']).default('asc').describe('Sort order'),
    limitRows: z.number().optional().describe('Limit number of rows'),
    title: z.string().default('Processed Data').describe('Title for the dataset'),
  }),
  execute: async ({ 
    csvUrl, identifierColumn, removeNulls, filterColumn, filterOperator, filterValue, 
    sortBy, sortOrder, limitRows, title 
  }) => {
    console.log('🔧 processDataForDashboard called with:', { 
      csvUrl, identifierColumn, removeNulls, filterColumn, filterOperator, filterValue,
      sortBy, sortOrder, limitRows, title
    });
    
    try {
      // Fetch and parse CSV data
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }
      
      const csvData = await response.text();
      const { headers, data } = parseCSV(csvData);
      
      let processedData = [...data];
      const operations: string[] = [`Loaded ${data.length} rows from source`];
      const stats: any = { originalRows: data.length };
      
      // Step 1: Remove nulls
      if (removeNulls) {
        const before = processedData.length;
        processedData = processedData.filter(row => 
          headers.every(h => row[h] !== null && row[h] !== undefined && row[h] !== '')
        );
        const removed = before - processedData.length;
        if (removed > 0) {
          operations.push(`Removed ${removed} rows with null values`);
          stats.nullsRemoved = removed;
        }
      }
      
      // Step 2: Handle duplicates if identifier column provided
      if (identifierColumn && headers.includes(identifierColumn)) {
        const identifierCounts: Record<string, number> = {};
        processedData.forEach(row => {
          const id = String(row[identifierColumn]);
          identifierCounts[id] = (identifierCounts[id] || 0) + 1;
        });
        
        const uniqueEntries = Object.keys(identifierCounts).length;
        const duplicateEntries = processedData.length - uniqueEntries;
        const duplicatePercentage = (duplicateEntries / processedData.length) * 100;
        
        if (duplicatePercentage > 10) {
          // Auto-detect numeric columns for aggregation
          const numericColumns = headers.filter(header => {
            if (header === identifierColumn) return false;
            const values = processedData.map(row => row[header]).filter(v => v !== null && v !== undefined);
            if (values.length === 0) return false;
            const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
            return numericValues.length > values.length * 0.8;
          });
          
          // Group and aggregate
          const groups: Record<string, any[]> = {};
          processedData.forEach(row => {
            const id = String(row[identifierColumn]);
            if (!groups[id]) groups[id] = [];
            groups[id].push(row);
          });
          
          const beforeAggregation = processedData.length;
          processedData = Object.entries(groups).map(([id, rows]) => {
            const aggregatedRow: any = { [identifierColumn]: id };
            
            headers.forEach(header => {
              if (header === identifierColumn) return;
              
              if (numericColumns.includes(header)) {
                const values = rows.map(r => Number(r[header])).filter(v => !isNaN(v));
                aggregatedRow[header] = values.reduce((a, b) => a + b, 0);
              } else {
                const firstValue = rows.find(r => r[header] !== null && r[header] !== undefined)?.[header];
                aggregatedRow[header] = firstValue || '';
              }
            });
            
            return aggregatedRow;
          });
          
          operations.push(`Resolved ${duplicatePercentage.toFixed(1)}% duplicates: ${beforeAggregation} → ${processedData.length} rows`);
          stats.duplicatesResolved = beforeAggregation - processedData.length;
          stats.aggregatedColumns = numericColumns;
        } else {
          operations.push(`Low duplicate rate (${duplicatePercentage.toFixed(1)}%) - no aggregation needed`);
        }
      }
      
      // Step 3: Apply filter
      if (filterColumn && filterOperator && filterValue && headers.includes(filterColumn)) {
        const before = processedData.length;
        processedData = processedData.filter(row => {
          const cellValue = row[filterColumn];
          const numericValue = parseFloat(filterValue);
          const compareValue = isNaN(numericValue) ? filterValue : numericValue;
          
          switch (filterOperator) {
            case '>': return Number(cellValue) > Number(compareValue);
            case '<': return Number(cellValue) < Number(compareValue);
            case '==': return cellValue == compareValue;
            case '!=': return cellValue != compareValue;
            default: return true;
          }
        });
        operations.push(`Filtered by ${filterColumn} ${filterOperator} ${filterValue}: ${before} → ${processedData.length} rows`);
        stats.filtered = before - processedData.length;
      }
      
      // Step 4: Sort data
      if (sortBy && headers.includes(sortBy)) {
        processedData.sort((a, b) => {
          const aVal = a[sortBy];
          const bVal = b[sortBy];
          
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
          } else {
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            return sortOrder === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
          }
        });
        operations.push(`Sorted by ${sortBy} (${sortOrder})`);
      }
      
      // Step 5: Limit rows
      if (limitRows && limitRows < processedData.length) {
        processedData = processedData.slice(0, limitRows);
        operations.push(`Limited to first ${limitRows} rows`);
        stats.limited = true;
      }
      
      // Create processed CSV
      const processedCsv = dataToCSV(headers, processedData);
      
      // Generate summary statistics
      const summary = {
        totalRows: processedData.length,
        totalColumns: headers.length,
        numericColumns: headers.filter(h => {
          const values = processedData.map(row => row[h]);
          const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
          return numericValues.length > values.length * 0.8;
        }),
        textColumns: headers.filter(h => {
          const values = processedData.map(row => row[h]);
          const textValues = values.filter(v => typeof v === 'string' || isNaN(Number(v)));
          return textValues.length > values.length * 0.8;
        })
      };
      
      // Send to dashboard data tab
      dataStream.writeData({
        type: 'data-update',
        content: {
          title,
          csvData: processedCsv,
          headers,
          rowCount: processedData.length,
          operations,
          source: csvUrl,
          action: 'process',
          summary,
          stats
        }
      });
      
      const result = {
        success: true,
        message: `🔄 **Data Processing Complete!**\n\n📊 **Processing Pipeline:**\n${operations.map(op => `• ${op}`).join('\n')}\n\n**Final Dataset:** ${processedData.length} rows, ${headers.length} columns\n**Numeric Columns:** ${summary.numericColumns.join(', ')}\n**Text Columns:** ${summary.textColumns.join(', ')}\n\n🔄 **Dashboard Updated:** The processed data is now available in the dashboard data tab.`,
        operations: operations.join(' → '),
        finalRows: processedData.length,
        summary
      };
      
      console.log('✅ processDataForDashboard success:', result);
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ processDataForDashboard error:', errorResult);
      return errorResult;
    }
  }
}); 