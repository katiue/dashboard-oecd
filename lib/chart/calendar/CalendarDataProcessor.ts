import Papa from 'papaparse';
import type { CalendarChartConfig } from './CalendarSchema';

export interface CalendarDataPoint {
  day: string; // Date in YYYY-MM-DD format
  value: number;
}

export function processCalendarData(csvData: string, config: CalendarChartConfig): CalendarDataPoint[] {
  try {
    // Parse CSV data
    const parseResult = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing errors:', parseResult.errors);
    }

    const rows = parseResult.data as Record<string, any>[];
    
    if (rows.length === 0) {
      return [];
    }

    const { dateColumn, valueColumn } = config.dataMapping;

    // Transform data for Nivo Calendar
    const calendarData: CalendarDataPoint[] = rows
      .map((row, index) => {
        try {
          const dateValue = row[dateColumn];
          const value = row[valueColumn];

          if (!dateValue || value === undefined || value === null || value === '') {
            return null;
          }

          // Parse and format date
          const date = new Date(dateValue);
          
          if (Number.isNaN(date.getTime())) {
            console.warn(`Invalid date at row ${index + 1}: ${dateValue}`);
            return null;
          }

          // Format as YYYY-MM-DD
          const formattedDate = date.toISOString().split('T')[0];

          // Parse value
          const numericValue = typeof value === 'number' ? value : Number.parseFloat(value);
          
          if (Number.isNaN(numericValue)) {
            console.warn(`Invalid value at row ${index + 1}: ${value}`);
            return null;
          }

          return {
            day: formattedDate,
            value: numericValue,
          };
        } catch (error) {
          console.warn(`Error processing row ${index + 1}:`, error);
          return null;
        }
      })
      .filter((item): item is CalendarDataPoint => item !== null);

    return calendarData;
  } catch (error) {
    console.error('Error processing calendar data:', error);
    return [];
  }
}

export function validateCalendarData(csvData: string, config: CalendarChartConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Parse CSV to check structure
    const parseResult = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      errors.push(...parseResult.errors.map(err => `CSV parsing error: ${err.message}`));
    }

    const rows = parseResult.data as Record<string, any>[];
    
    if (rows.length === 0) {
      errors.push('No data rows found in CSV');
      return { valid: false, errors, warnings };
    }

    // Check if required columns exist
    const headers = Object.keys(rows[0] || {});
    const { dateColumn, valueColumn } = config.dataMapping;

    if (!headers.includes(dateColumn)) {
      errors.push(`Date column '${dateColumn}' not found in CSV headers: ${headers.join(', ')}`);
    }

    if (!headers.includes(valueColumn)) {
      errors.push(`Value column '${valueColumn}' not found in CSV headers: ${headers.join(', ')}`);
    }

    if (errors.length > 0) {
      return { valid: false, errors, warnings };
    }

    // Validate data types and ranges
    let validRows = 0;
    let invalidDates = 0;
    let invalidValues = 0;

    rows.forEach((row, index) => {
      const dateValue = row[dateColumn];
      const value = row[valueColumn];

      // Check date validity
      if (dateValue) {
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) {
          invalidDates++;
        }
      }

      // Check value validity
      if (value !== undefined && value !== null && value !== '') {
        const numericValue = typeof value === 'number' ? value : Number.parseFloat(value);
        if (Number.isNaN(numericValue)) {
          invalidValues++;
        } else {
          validRows++;
        }
      }
    });

    if (validRows === 0) {
      errors.push('No valid data rows found');
    }

    if (invalidDates > 0) {
      warnings.push(`${invalidDates} rows have invalid dates`);
    }

    if (invalidValues > 0) {
      warnings.push(`${invalidValues} rows have invalid values`);
    }

    return {
      valid: errors.length === 0 && validRows > 0,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { valid: false, errors, warnings };
  }
}

// Unified validation function for CSV compatibility
export function validateCsvForCalendar(csvData: string, config: CalendarChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const result = validateCalendarData(csvData, config);
  const lines = csvData.trim().split('\n');
  const headers = lines.length > 0 ? lines[0].split(',').map(h => h.trim().replace(/['"]/g, '')) : [];
  const requiredColumns = [config.dataMapping.dateColumn, config.dataMapping.valueColumn];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: result.valid && missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
}

// Data mapping example for the calendar chart
export const DATA_MAPPING_EXAMPLE = {
  description: 'Calendar chart requires date and value columns. Dates should be in a parseable format (YYYY-MM-DD, MM/DD/YYYY, etc.), and values should be numeric.',
  example: {
    date: '2023-01-15',
    value: 42,
    // Optional additional columns are ignored
    category: 'Sales',
    region: 'North America',
  },
}; 