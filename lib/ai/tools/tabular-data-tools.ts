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
      const numValue = Number.parseFloat(value);
      row[header] = Number.isNaN(numValue) ? value : numValue;
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
        
        if (!Number.isNaN(value)) {
          switch (operation) {
            case 'normalize': {
              // Simple 0-1 normalization
              const values = data.map((r: any) => Number(r[column])).filter((v: any) => !Number.isNaN(v));
              const min = Math.min(...values);
              const max = Math.max(...values);
              (newRow as any)[column] = (value - min) / (max - min);
              break;
            }
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
      const values = data.map((row: any) => Number((row as any)[column])).filter((v: number) => !Number.isNaN(v));
      
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
        return values.length > 0 && !Number.isNaN(Number(values[0]));
      });
      
      const statistics: Record<string, any> = {};
      
              analyzeColumns.forEach(column => {
          const values = (data as any[]).map((row: any) => Number(row[column])).filter((v: any) => !Number.isNaN(v));
        
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
          values.forEach((v: any) => {
            freq[v] = (freq[v] || 0) + 1;
          });
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
        const values = rows.map(r => Number(r[valueColumn])).filter(v => !Number.isNaN(v));
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
            case 'median': {
              const sorted = [...values].sort((a, b) => a - b);
              result[`${valueColumn}_median`] = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
              break;
            }
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
      
      const qualityIssues: string[] = [];
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
          const numericValues = nonNullValues.map(v => Number(v)).filter(v => !Number.isNaN(v));
          
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
                const year = Number.parseInt(String(yearValue));
                if (!Number.isNaN(year)) {
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
                case 'interpolate': {
                  // Simple interpolation based on nearby values
                  const prevValue = index > 0 ? cleanedData[index - 1][col] : 0;
                  const nextValue = index < cleanedData.length - 1 ? cleanedData[index + 1][col] : 0;
                  newRow[col] = Math.round((Number(prevValue) + Number(nextValue)) / 2) || 0;
                  break;
                }
                case 'remove':
                  // Will be filtered out later
                  break;
              }
            } else {
              // Ensure numeric values
              const numValue = Number(value);
              newRow[col] = Number.isNaN(numValue) ? 0 : Math.max(0, numValue);
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
                patentColumns.forEach(col => {
                  countryAggregation[country][col] = 0;
                });
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
// ADVANCED CSV DATA PROCESSING TOOLS
// ============================================================================

// Tool 19: Load CSV from URL with Large File Support
export const createLoadCsvFromUrl = ({ dataStream }: { dataStream?: any }) => tool({
  description: 'Load and parse CSV data from URL with support for large files (up to GB). Creates a local working copy and handles memory efficiently.',
  parameters: z.object({
    url: z.string().describe('URL to the CSV file'),
    fileName: z.string().describe('Original file name to use as tab title'),
    sampleSize: z.number().default(1000).describe('Number of rows to sample for preview (default 1000)'),
    maxPreviewRows: z.number().default(10).describe('Maximum rows to show in preview (default 10)'),
  }),
  execute: async ({ url, fileName, sampleSize, maxPreviewRows }) => {
    console.log('🔧 loadCsvFromUrl called with:', { url, fileName, sampleSize, maxPreviewRows });
    
    try {
      // Fetch CSV data with progress tracking
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }
      
      const csvData = await response.text();
      const { headers, data } = parseCSV(csvData);
      
      // Create a sample for preview and memory efficiency
      const sampleData = data.slice(0, Math.min(sampleSize, data.length));
      const previewData = sampleData.slice(0, maxPreviewRows);
      
      // Basic data profiling
      const profile = {
        totalRows: data.length,
        totalColumns: headers.length,
        sampleRows: sampleData.length,
        previewRows: previewData.length,
        estimatedSizeKB: Math.round(csvData.length / 1024),
        headers: headers.slice(0, 20), // Limit headers for display
        columnTypes: headers.slice(0, 10).map(header => {
          const values = sampleData.map(row => row[header]).filter(v => v != null && v !== '').slice(0, 100);
          const numericValues = values.map(v => Number(v)).filter(v => !Number.isNaN(v));
          const isNumeric = numericValues.length > values.length * 0.8;
          const isDate = values.some(v => !Number.isNaN(Date.parse(v)));
          
          return {
            name: header,
            type: isNumeric ? 'numeric' : isDate ? 'date' : 'text',
            sampleValues: values.slice(0, 3),
            nullCount: sampleData.length - values.length
          };
        })
      };
      
      // Use provided fileName or fallback to URL-based name
      const tabTitle = fileName || `Data from ${url.split('/').pop() || 'CSV'}`;
      
      // Send data stream event to create CSV tab
      if (dataStream) {
        dataStream.writeData({
          type: 'csv-tab-create',
          content: {
            title: tabTitle,
            csvData: csvData
          }
        });
      }

      const result = {
        success: true,
        message: `📊 **CSV Loaded Successfully!**\n\n**Dataset Overview:**\n• Total rows: ${profile.totalRows.toLocaleString()}\n• Columns: ${profile.totalColumns}\n• File size: ${profile.estimatedSizeKB} KB\n• Sample loaded: ${profile.sampleRows.toLocaleString()} rows\n\n**Column Types Detected:**\n${profile.columnTypes.map(col => `• ${col.name}: ${col.type}`).join('\n')}\n\n**Agent Preview (10 rows):**\n${previewData.map((row, i) => `${i+1}. ${Object.values(row).slice(0, 3).join(' | ')}`).join('\n')}\n\n🔄 **Next Steps:** Run cleanData() and detectAndResolveDuplicates() for optimal data quality.\n\n📋 **New CSV Tab Created:** Access your data in the new CSV data table tab.`,
        profile,
        csvData, // Full CSV for processing
        sampleData, // Sample for memory efficiency
        previewData, // Small preview for display (10 rows for agent)
        agentPreview: previewData, // Explicitly for agent viewing
        workingDataId: `csv_${Date.now()}`, // Unique identifier for this dataset
        createCsvTab: true, // Flag to create new CSV tab
        tabTitle: tabTitle
      };
      
      console.log('✅ loadCsvFromUrl success:', {
        totalRows: profile.totalRows,
        sampleRows: profile.sampleRows,
        sizeKB: profile.estimatedSizeKB
      });
      
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ loadCsvFromUrl error:', errorResult);
      return errorResult;
    }
  }
});

// Advanced Data Cleaning
export const createCleanData = ({ dataStream }: { dataStream?: any }) => tool({
  description: 'Comprehensive data cleaning: trim whitespace, normalize formatting, fix CSV quirks, handle encoding issues.',
  parameters: z.object({
    data: z.any().describe('Data to clean (array of objects)'),
    headers: z.array(z.string()).describe('Column headers'),
    options: z.object({
      trimWhitespace: z.boolean().default(true),
      normalizeText: z.boolean().default(true),
      fixEncodingIssues: z.boolean().default(true),
      removeEmptyRows: z.boolean().default(true),
      standardizeNulls: z.boolean().default(true)
    }).optional().describe('Cleaning options')
  }),
  execute: async ({ data, headers, options = {} }) => {
    console.log('🔧 cleanData called with:', { 
      dataLength: data?.length, 
      headersLength: headers?.length,
      options
    });
    
    try {
      const opts = {
        trimWhitespace: true,
        normalizeText: true,
        fixEncodingIssues: true,
        removeEmptyRows: true,
        standardizeNulls: true,
        ...options
      };
      
      let cleanedData = [...data];
      const operations: string[] = [`Started with ${data.length} rows`];
      
      // Remove completely empty rows
      if (opts.removeEmptyRows) {
        const before = cleanedData.length;
        cleanedData = cleanedData.filter(row => 
          headers.some(h => row[h] !== null && row[h] !== undefined && String(row[h]).trim() !== '')
        );
        if (before !== cleanedData.length) {
          operations.push(`Removed ${before - cleanedData.length} empty rows`);
        }
      }
      
      // Clean each cell
      let cellsCleaned = 0;
      cleanedData = cleanedData.map(row => {
        const cleanedRow: any = {};
        headers.forEach(header => {
          let value = row[header];
          
          if (value === null || value === undefined) {
            cleanedRow[header] = null;
            return;
          }
          
          const originalValue = value;
          value = String(value);
          
          // Trim whitespace
          if (opts.trimWhitespace) {
            value = value.trim();
          }
          
          // Normalize text
          if (opts.normalizeText) {
            // Fix common encoding issues
            value = value
              .replace(/â€™/g, "'")
              .replace(/â€œ/g, '"')
              .replace(/â€/g, '"')
              .replace(/â€"/g, '—')
              .replace(/Â/g, '');
          }
          
          // Standardize null values
          if (opts.standardizeNulls) {
            if (['null', 'NULL', 'nil', 'NIL', 'n/a', 'N/A', 'na', 'NA', '#N/A', '-', ''].includes(value)) {
              value = null;
            }
          }
          
          if (value !== originalValue) {
            cellsCleaned++;
          }
          
          cleanedRow[header] = value;
        });
        return cleanedRow;
      });
      
      operations.push(`Cleaned ${cellsCleaned} cells`);
      
      // Send data stream event to create/update CSV tab
      const cleanedCsv = dataToCSV(headers, cleanedData);
      if (dataStream) {
        dataStream.writeData({
          type: 'csv-tab-create',
          content: {
            title: 'Cleaned Data',
            csvData: cleanedCsv
          }
        });
      }
      
      const result = {
        success: true,
        message: `🧹 **Data Cleaned Successfully!**\n\n**Cleaning Operations:**\n${operations.map(op => `• ${op}`).join('\n')}\n\n**Final Dataset:** ${cleanedData.length} clean rows\n\n**Agent Preview (10 rows):**\n${cleanedData.slice(0, 10).map((row, i) => `${i+1}. ${Object.values(row).slice(0, 3).join(' | ')}`).join('\n')}\n\n🔬 **Quality Improved:** Data is now standardized and ready for analysis.\n\n📋 **New CSV Tab Created:** Access your cleaned data in the new CSV data table tab.`,
        cleanedData,
        agentPreview: cleanedData.slice(0, 10), // Only 10 rows for agent viewing
        operations: operations.join(' → '),
        originalRows: data.length,
        cleanedRows: cleanedData.length,
        cellsCleaned
      };
      
      console.log('✅ cleanData success:', {
        originalRows: result.originalRows,
        cleanedRows: result.cleanedRows,
        cellsCleaned: result.cellsCleaned
      });
      
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ cleanData error:', errorResult);
      return errorResult;
    }
  }
});

// Enhanced Duplicate Detection and Resolution
export const createDetectAndResolveDuplicates = ({ dataStream }: { dataStream?: any }) => tool({
  description: 'Enhanced duplicate detection that handles similar names intelligently. When duplicates are found, it either aggregates them or creates unique identifiers (e.g., Perch_1, Perch_2) for better visualization.',
  parameters: z.object({
    data: z.any().describe('Data to analyze for duplicates'),
    headers: z.array(z.string()).describe('Column headers'),
    identifierColumn: z.string().describe('Column to check for duplicates'),
    strategy: z.enum(['aggregate', 'rename', 'auto']).default('auto').describe('How to handle duplicates: aggregate (sum values), rename (add suffixes), or auto (decide based on data)'),
    threshold: z.number().default(0.1).describe('Duplicate threshold (0.1 = 10%)'),
  }),
  execute: async ({ data, headers, identifierColumn, strategy, threshold }) => {
    console.log('🔧 detectAndResolveDuplicatesAdvanced called with:', { 
      dataLength: data?.length, 
      identifierColumn, 
      strategy, 
      threshold
    });
    
    try {
      if (!headers.includes(identifierColumn)) {
        return {
          success: false,
          error: `Identifier column '${identifierColumn}' not found. Available: ${headers.join(', ')}`
        };
      }
      
      // Analyze duplicates
      const identifierCounts: Record<string, number> = {};
      const duplicateGroups: Record<string, any[]> = {};
      
      data.forEach((row: any) => {
        const id = String(row[identifierColumn]).trim();
        identifierCounts[id] = (identifierCounts[id] || 0) + 1;
        if (!duplicateGroups[id]) duplicateGroups[id] = [];
        duplicateGroups[id].push(row);
      });
      
      const totalEntries = data.length;
      const uniqueEntries = Object.keys(identifierCounts).length;
      const duplicateEntries = totalEntries - uniqueEntries;
      const duplicatePercentage = (duplicateEntries / totalEntries) * 100;
      
      // Identify numeric columns for aggregation
      const numericColumns = headers.filter(header => {
        if (header === identifierColumn) return false;
        const values = data.map((row: any) => row[header]).filter((v: any) => v !== null && v !== undefined);
        const numericValues = values.map((v: any) => Number(v)).filter((v: any) => !Number.isNaN(v));
        return numericValues.length > values.length * 0.8;
      });
      
      const operations: string[] = [`Analyzed ${totalEntries} rows`];
      operations.push(`Found ${duplicatePercentage.toFixed(1)}% duplicates in ${identifierColumn}`);
      
      let processedData = data;
      let resolutionStrategy = strategy;
      
      if (duplicatePercentage >= threshold * 100) {
        // Auto-decide strategy if not specified
        if (strategy === 'auto') {
          // If we have many numeric columns, aggregate; otherwise rename
          resolutionStrategy = numericColumns.length >= 2 ? 'aggregate' : 'rename';
          operations.push(`Auto-selected strategy: ${resolutionStrategy}`);
        }
        
        if (resolutionStrategy === 'aggregate') {
          // Aggregate duplicates by summing numeric columns
          processedData = Object.entries(duplicateGroups).map(([id, rows]) => {
          const aggregatedRow: any = { [identifierColumn]: id };
          
          headers.forEach(header => {
            if (header === identifierColumn) return;
            
              if (numericColumns.includes(header)) {
              const values = rows.map(r => Number(r[header])).filter(v => !Number.isNaN(v));
              aggregatedRow[header] = values.reduce((a, b) => a + b, 0);
            } else {
              // Take first non-null value
              const firstValue = rows.find(r => r[header] !== null && r[header] !== undefined)?.[header];
              aggregatedRow[header] = firstValue || '';
            }
          });
          
          return aggregatedRow;
        });
        
        operations.push(`Aggregated ${totalEntries} rows into ${processedData.length} unique entries`);
          operations.push(`Summed columns: ${numericColumns.join(', ')}`);
          
        } else if (resolutionStrategy === 'rename') {
          // Rename duplicates with unique suffixes
          const nameCounters: Record<string, number> = {};
          
          processedData = data.map((row: any) => {
            const id = String(row[identifierColumn]).trim();
            const newRow = { ...row };
            
            if (identifierCounts[id] > 1) {
              nameCounters[id] = (nameCounters[id] || 0) + 1;
              const suffix = nameCounters[id];
              newRow[identifierColumn] = `${id}_${suffix}`;
            }
            
            return newRow;
          });
          
          const renamedCount = Object.values(nameCounters).reduce((a, b) => a + b, 0);
          operations.push(`Renamed ${renamedCount} duplicate entries with unique suffixes`);
        }
      } else {
        operations.push(`Low duplicate rate - no resolution needed`);
      }
      
      // Send data stream event to create/update CSV tab if duplicates were resolved
      if (duplicatePercentage >= threshold * 100) {
        const processedCsv = dataToCSV(headers, processedData);
        if (dataStream) {
          dataStream.writeData({
            type: 'csv-tab-create',
            content: {
              title: 'Duplicates Resolved',
              csvData: processedCsv
            }
          });
        }
      }
      
      const result = {
        success: true,
        message: `🔍 **Duplicate Analysis Complete!**\n\n**Results:**\n• ${duplicatePercentage.toFixed(1)}% duplicates detected\n• Strategy used: ${resolutionStrategy}\n• Final dataset: ${processedData.length} rows\n\n**Operations:**\n${operations.map(op => `• ${op}`).join('\n')}\n\n**Agent Preview (10 rows):**\n${processedData.slice(0, 10).map((row: any, i: number) => `${i+1}. ${Object.values(row).slice(0, 3).join(' | ')}`).join('\n')}\n\n✨ **Data Quality:** ${resolutionStrategy === 'aggregate' ? 'Values aggregated for clean analysis' : 'Unique identifiers created for clear visualization'}${duplicatePercentage >= threshold * 100 ? '\n\n📋 **New CSV Tab Created:** Access your processed data in the new CSV data table tab.' : ''}`,
        processedData,
        agentPreview: processedData.slice(0, 10), // Only 10 rows for agent viewing
        duplicatePercentage: Math.round(duplicatePercentage * 10) / 10,
        originalRows: totalEntries,
        finalRows: processedData.length,
        strategy: resolutionStrategy,
        operations: operations.join(' → '),
        duplicateDetails: Object.entries(identifierCounts)
          .filter(([_, count]) => count > 1)
          .map(([id, count]) => ({ id, count }))
      };
      
      console.log('✅ detectAndResolveDuplicates success:', {
        duplicatePercentage: result.duplicatePercentage,
        strategy: result.strategy,
        originalRows: result.originalRows,
        finalRows: result.finalRows
      });
      
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ detectAndResolveDuplicates error:', errorResult);
      return errorResult;
    }
  }
});

// Tool 22: Intelligent Type Inference and Casting
export const inferAndCastTypes = tool({
  description: 'Automatically detect and cast data types (numeric, date, categorical) with user confirmation and data validation.',
  parameters: z.object({
    data: z.any().describe('Data to analyze and cast types'),
    headers: z.array(z.string()).describe('Column headers'),
    autoApply: z.boolean().default(false).describe('Automatically apply type casting without confirmation'),
  }),
  execute: async ({ data, headers, autoApply }) => {
    console.log('🔧 inferAndCastTypes called with:', { 
      dataLength: data?.length, 
      headersLength: headers?.length,
      autoApply
    });
    
    try {
      const typeInferences: Record<string, any> = {};
      let totalCasts = 0;
      
      // Analyze each column
      headers.forEach(header => {
        const values = data.map((row: any) => row[header]).filter((v: any) => v !== null && v !== undefined && v !== '');
        const sampleValues = values.slice(0, 100); // Sample for performance
        
        let inferredType = 'text';
        let confidence = 0;
        let castableValues = 0;
        let errorCount = 0;
        
        // Test for numeric type
        const numericValues = sampleValues.map((v: any) => Number(v)).filter((v: any) => !Number.isNaN(v));
        if (numericValues.length > sampleValues.length * 0.8) {
          inferredType = 'numeric';
          confidence = numericValues.length / sampleValues.length;
          castableValues = numericValues.length;
        }
        
        // Test for date type
        const dateValues = sampleValues.filter((v: any) => {
          const date = new Date(v);
          return !Number.isNaN(date.getTime()) && date.getFullYear() > 1900;
        });
        if (dateValues.length > sampleValues.length * 0.7 && dateValues.length > numericValues.length) {
          inferredType = 'date';
          confidence = dateValues.length / sampleValues.length;
          castableValues = dateValues.length;
        }
        
        // Test for boolean type
        const booleanValues = sampleValues.filter((v: any) => {
          const str = String(v).toLowerCase();
          return ['true', 'false', 'yes', 'no', '1', '0', 'y', 'n'].includes(str);
        });
        if (booleanValues.length > sampleValues.length * 0.9) {
          inferredType = 'boolean';
          confidence = booleanValues.length / sampleValues.length;
          castableValues = booleanValues.length;
        }
        
        typeInferences[header] = {
          currentType: 'text',
          inferredType,
          confidence: Math.round(confidence * 100),
          castableValues,
          totalValues: values.length,
          sampleValues: sampleValues.slice(0, 3),
          errorCount
        };
      });
      
      let castedData = data;
      
      if (autoApply) {
        // Apply type casting
        castedData = data.map((row: any) => {
          const newRow = { ...row };
          
          headers.forEach(header => {
            const inference = typeInferences[header];
            const value = row[header];
            
            if (value === null || value === undefined || value === '') {
              return;
            }
            
            try {
              switch (inference.inferredType) {
                case 'numeric':
                  if (inference.confidence >= 80) {
                    const numValue = Number(value);
                    if (!Number.isNaN(numValue)) {
                      newRow[header] = numValue;
                      totalCasts++;
                    }
                  }
                  break;
                case 'date':
                  if (inference.confidence >= 70) {
                    const dateValue = new Date(value);
                    if (!Number.isNaN(dateValue.getTime())) {
                      newRow[header] = dateValue.toISOString().split('T')[0]; // YYYY-MM-DD format
                      totalCasts++;
                    }
                  }
                  break;
                case 'boolean':
                  if (inference.confidence >= 90) {
                    const str = String(value).toLowerCase();
                    if (['true', 'yes', '1', 'y'].includes(str)) {
                      newRow[header] = true;
                      totalCasts++;
                    } else if (['false', 'no', '0', 'n'].includes(str)) {
                      newRow[header] = false;
                      totalCasts++;
                    }
                  }
                  break;
              }
            } catch (error) {
              // Keep original value if casting fails
              typeInferences[header].errorCount++;
            }
          });
          
          return newRow;
        });
      }
      
      const highConfidenceInferences = Object.entries(typeInferences)
        .filter(([_, inference]) => inference.confidence >= 70 && inference.inferredType !== 'text')
        .length;
      
      const result = {
        success: true,
        message: `🔍 **Type Inference Complete!**\n\n**Analysis Results:**\n• ${highConfidenceInferences} columns with high-confidence type detection\n• ${totalCasts} values cast to new types\n\n**Detected Types:**\n${Object.entries(typeInferences)
          .filter(([_, inf]) => inf.inferredType !== 'text')
          .map(([col, inf]) => `• ${col}: ${inf.inferredType} (${inf.confidence}% confidence)`)
          .join('\n') || '• No type changes recommended'}\n\n${autoApply ? '✅ **Types Applied:** Data has been cast to inferred types' : '⏳ **Pending:** Set autoApply=true to cast types'}`,
        typeInferences,
        castedData: autoApply ? castedData : data,
        totalCasts,
        highConfidenceCount: highConfidenceInferences,
        autoApplied: autoApply
      };
      
      console.log('✅ inferAndCastTypes success:', {
        highConfidenceCount: result.highConfidenceCount,
        totalCasts: result.totalCasts,
        autoApplied: result.autoApplied
      });
      
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ inferAndCastTypes error:', errorResult);
      return errorResult;
    }
  }
});

// Advanced Data Filtering
export const filterData = tool({
  description: 'Apply sophisticated row-level filters with multiple conditions, ranges, and pattern matching.',
  parameters: z.object({
    data: z.any().describe('Data to filter'),
    headers: z.array(z.string()).describe('Column headers'),
    filters: z.array(z.object({
      column: z.string(),
      operator: z.enum(['>', '<', '>=', '<=', '==', '!=', 'contains', 'startsWith', 'endsWith', 'in', 'between']),
      value: z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))]),
      caseSensitive: z.boolean().default(false)
    })).describe('Array of filter conditions'),
    logic: z.enum(['AND', 'OR']).default('AND').describe('Logic to combine multiple filters'),
  }),
  execute: async ({ data, headers, filters, logic }) => {
    console.log('🔧 filterDataAdvanced called with:', { 
      dataLength: data?.length, 
      filtersCount: filters?.length,
      logic
    });
    
    try {
      // Validate filters
      for (const filter of filters) {
        if (!headers.includes(filter.column)) {
          return {
            success: false,
            error: `Column '${filter.column}' not found. Available: ${headers.join(', ')}`
          };
        }
      }
      
      const originalCount = data.length;
      
      const filteredData = data.filter((row: any) => {
        const results = filters.map(filter => {
          const cellValue = row[filter.column];
          const { operator, value, caseSensitive } = filter;
          
          if (cellValue === null || cellValue === undefined) {
            return false;
          }
          
          const cellStr = caseSensitive ? String(cellValue) : String(cellValue).toLowerCase();
          const compareValue = Array.isArray(value) ? value : [value];
          const compareStr = caseSensitive ? compareValue : compareValue.map(v => String(v).toLowerCase());
          
          switch (operator) {
            case '>':
              return Number(cellValue) > Number(compareValue[0]);
            case '<':
              return Number(cellValue) < Number(compareValue[0]);
            case '>=':
              return Number(cellValue) >= Number(compareValue[0]);
            case '<=':
              return Number(cellValue) <= Number(compareValue[0]);
            case '==':
              return cellStr === String(compareStr[0]);
            case '!=':
              return cellStr !== String(compareStr[0]);
            case 'contains':
              return cellStr.includes(String(compareStr[0]));
            case 'startsWith':
              return cellStr.startsWith(String(compareStr[0]));
            case 'endsWith':
              return cellStr.endsWith(String(compareStr[0]));
            case 'in':
              return compareStr.includes(cellStr);
            case 'between':
              if (compareValue.length >= 2) {
                const numValue = Number(cellValue);
                return numValue >= Number(compareValue[0]) && numValue <= Number(compareValue[1]);
              }
              return false;
            default:
              return false;
          }
        });
        
        return logic === 'AND' ? results.every(r => r) : results.some(r => r);
      });
      
      const filterDescription = filters.map(f => 
        `${f.column} ${f.operator} ${Array.isArray(f.value) ? f.value.join(',') : f.value}`
      ).join(` ${logic} `);
      
      const result = {
        success: true,
        message: `🔍 **Data Filtered Successfully!**\n\n**Filter Applied:**\n• ${filterDescription}\n\n**Results:**\n• Original: ${originalCount.toLocaleString()} rows\n• Filtered: ${filteredData.length.toLocaleString()} rows\n• Reduction: ${((originalCount - filteredData.length) / originalCount * 100).toFixed(1)}%\n\n**Agent Preview (10 rows):**\n${filteredData.slice(0, 10).map((row: any, i: number) => `${i+1}. ${Object.values(row).slice(0, 3).join(' | ')}`).join('\n')}\n\n📊 **Ready for Analysis:** Filtered dataset is optimized for visualization and analysis.`,
        filteredData,
        agentPreview: filteredData.slice(0, 10), // Only 10 rows for agent viewing
        originalCount,
        filteredCount: filteredData.length,
        filterDescription,
        reductionPercentage: Math.round(((originalCount - filteredData.length) / originalCount * 100) * 10) / 10
      };
      
      console.log('✅ filterData success:', {
        originalCount: result.originalCount,
        filteredCount: result.filteredCount,
        reductionPercentage: result.reductionPercentage
      });
      
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ filterData error:', errorResult);
      return errorResult;
    }
  }
});

// Advanced Data Aggregation
export const createAggregateData = ({ dataStream }: { dataStream?: any }) => tool({
  description: 'Compute comprehensive grouped metrics (sum, count, avg, min, max, median) with multiple grouping levels and custom operations.',
  parameters: z.object({
    data: z.any().describe('Data to aggregate'),
    headers: z.array(z.string()).describe('Column headers'),
    groupBy: z.array(z.string()).describe('Columns to group by'),
    operations: z.array(z.object({
      column: z.string(),
      operation: z.enum(['sum', 'count', 'avg', 'min', 'max', 'median', 'std', 'first', 'last']),
      alias: z.string().optional()
    })).describe('Aggregation operations to perform'),
  }),
  execute: async ({ data, headers, groupBy, operations }) => {
    console.log('🔧 aggregateDataAdvanced called with:', { 
      dataLength: data?.length, 
      groupByColumns: groupBy?.length,
      operationsCount: operations?.length
    });
    
    try {
      // Validate columns
      const invalidCols = [...groupBy, ...operations.map(op => op.column)].filter(col => !headers.includes(col));
      if (invalidCols.length > 0) {
        return {
          success: false,
          error: `Columns not found: ${invalidCols.join(', ')}. Available: ${headers.join(', ')}`
        };
      }
      
      // Group the data
      const groups: Record<string, any[]> = {};
      data.forEach((row: any) => {
        const key = groupBy.map(col => String(row[col])).join('|');
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      });
      
      // Perform aggregations
      const aggregatedData = Object.entries(groups).map(([key, rows]) => {
        const keyValues = key.split('|');
        const result: any = {};
        
        // Add grouping columns
        groupBy.forEach((col, index) => {
          result[col] = keyValues[index];
        });
        
        // Perform operations
        operations.forEach(op => {
          const { column, operation, alias } = op;
          const outputColumn = alias || `${column}_${operation}`;
          const values = rows.map(r => r[column]).filter(v => v !== null && v !== undefined);
          const numericValues = values.map(v => Number(v)).filter(v => !Number.isNaN(v));
          
          switch (operation) {
            case 'sum':
              result[outputColumn] = numericValues.reduce((a, b) => a + b, 0);
              break;
            case 'count':
              result[outputColumn] = rows.length;
              break;
            case 'avg':
              result[outputColumn] = numericValues.length > 0 ? 
                numericValues.reduce((a, b) => a + b, 0) / numericValues.length : 0;
              break;
            case 'min':
              result[outputColumn] = numericValues.length > 0 ? Math.min(...numericValues) : null;
              break;
            case 'max':
              result[outputColumn] = numericValues.length > 0 ? Math.max(...numericValues) : null;
              break;
            case 'median': {
              if (numericValues.length > 0) {
                const sorted = [...numericValues].sort((a, b) => a - b);
                result[outputColumn] = sorted[Math.floor(sorted.length / 2)];
          } else {
                result[outputColumn] = null;
              }
              break;
            }
            case 'std': {
              if (numericValues.length > 1) {
                const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
                const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / numericValues.length;
                result[outputColumn] = Math.sqrt(variance);
              } else {
                result[outputColumn] = 0;
              }
              break;
            }
            case 'first':
              result[outputColumn] = values[0] || null;
              break;
            case 'last':
              result[outputColumn] = values[values.length - 1] || null;
              break;
          }
        });
        
        return result;
      });
      
      const operationSummary = operations.map(op => 
        `${op.operation}(${op.column})${op.alias ? ` as ${op.alias}` : ''}`
      ).join(', ');
      
      // Send data stream event to create/update CSV tab
      const newHeaders = [...groupBy, ...operations.map(op => op.alias || `${op.column}_${op.operation}`)];
      const aggregatedCsv = dataToCSV(newHeaders, aggregatedData);
      if (dataStream) {
        dataStream.writeData({
          type: 'csv-tab-create',
          content: {
            title: 'Aggregated Data',
            csvData: aggregatedCsv
          }
        });
      }
      
      const result = {
        success: true,
        message: `📊 **Data Aggregated Successfully!**\n\n**Aggregation:**\n• Group by: ${groupBy.join(', ')}\n• Operations: ${operationSummary}\n\n**Results:**\n• Original rows: ${data.length.toLocaleString()}\n• Grouped into: ${aggregatedData.length} groups\n• Reduction: ${((data.length - aggregatedData.length) / data.length * 100).toFixed(1)}%\n\n**Agent Preview (10 rows):**\n${aggregatedData.slice(0, 10).map((row: any, i: number) => `${i+1}. ${Object.values(row).slice(0, 3).join(' | ')}`).join('\n')}\n\n🎯 **Summary Created:** Data is now aggregated and ready for high-level analysis.\n\n📋 **New CSV Tab Created:** Access your aggregated data in the new CSV data table tab.`,
        aggregatedData,
        agentPreview: aggregatedData.slice(0, 10), // Only 10 rows for agent viewing
        originalRows: data.length,
        groupedRows: aggregatedData.length,
        groupBy,
        operations: operationSummary,
        reductionPercentage: Math.round(((data.length - aggregatedData.length) / data.length * 100) * 10) / 10
      };
      
      console.log('✅ aggregateData success:', {
        originalRows: result.originalRows,
        groupedRows: result.groupedRows,
        reductionPercentage: result.reductionPercentage
      });
      
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ aggregateData error:', errorResult);
      return errorResult;
    }
  }
});

// Quick Column Sum with Statistics
export const sumColumn = tool({
  description: 'Quick and comprehensive column summation with statistical insights and business context.',
  parameters: z.object({
    data: z.any().describe('Data to sum'),
    headers: z.array(z.string()).describe('Column headers'),
    column: z.string().describe('Column to sum'),
    includeStats: z.boolean().default(true).describe('Include additional statistical insights'),
  }),
  execute: async ({ data, headers, column, includeStats }) => {
    console.log('🔧 sumColumnAdvanced called with:', { 
      dataLength: data?.length, 
      column,
      includeStats
    });
    
    try {
      if (!headers.includes(column)) {
        return {
          success: false,
          error: `Column '${column}' not found. Available: ${headers.join(', ')}`
        };
      }
      
      const values = data.map((row: any) => row[column]).filter((v: any) => v !== null && v !== undefined && v !== '');
      const numericValues = values.map((v: any) => Number(v)).filter((v: any) => !Number.isNaN(v));
      
      if (numericValues.length === 0) {
        return {
          success: false,
          error: `No numeric values found in column '${column}'`
        };
      }
      
      const sum = numericValues.reduce((a: number, b: number) => a + b, 0);
      const count = numericValues.length;
      const totalRows = data.length;
      const average = sum / count;
      
             let additionalStats: any = {};
       if (includeStats) {
         const sorted = [...numericValues].sort((a, b) => a - b);
         const min = Math.min(...numericValues);
         const max = Math.max(...numericValues);
         const median = sorted[Math.floor(sorted.length / 2)];
         const range = max - min;
         
         // Calculate variance and standard deviation
          const variance = numericValues.reduce((acc: number, val: number) => acc + Math.pow(val - average, 2), 0) / count;
         const stdDev = Math.sqrt(variance);
         
         additionalStats = {
           min: Math.round(min * 100) / 100,
           max: Math.round(max * 100) / 100,
           median: Math.round(median * 100) / 100,
           range: Math.round(range * 100) / 100,
           stdDev: Math.round(stdDev * 100) / 100,
           variance: Math.round(variance * 100) / 100
         };
       }
      
      const result = {
        success: true,
         message: `💰 **Column Sum Complete: ${column}**\n\n**Summary:**\n• Total: ${sum.toLocaleString()}\n• Count: ${count.toLocaleString()} values\n• Average: ${Math.round(average * 100) / 100}\n• Coverage: ${Math.round((count / totalRows) * 100)}% of rows\n\n${includeStats ? `**Statistics:**\n• Min: ${additionalStats.min}\n• Max: ${additionalStats.max}\n• Median: ${additionalStats.median}\n• Range: ${additionalStats.range}\n• Std Dev: ${additionalStats.stdDev}\n\n` : ''}📊 **Business Insight:** ${sum >= 1000000 ? 'High-value metrics detected' : sum >= 1000 ? 'Moderate-scale values' : 'Small-scale measurements'} - suitable for ${sum >= 100000 ? 'executive dashboards' : 'operational reporting'}.`,
         column,
         sum: Math.round(sum * 100) / 100,
         count,
         totalRows,
         average: Math.round(average * 100) / 100,
         coverage: Math.round((count / totalRows) * 100),
         ...additionalStats
       };
      
      console.log('✅ sumColumn success:', {
        column: result.column,
        sum: result.sum,
        count: result.count,
        coverage: result.coverage
      });
      
      return result;
      
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      console.error('❌ sumColumn error:', errorResult);
      return errorResult;
    }
  }
}); 


