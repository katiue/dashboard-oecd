// Calendar Chart Module
import type { CalendarChartConfig } from './CalendarSchema';
import { validateCalendarData } from './CalendarDataProcessor';

export type { CalendarChartConfig } from './CalendarSchema';
export { DATA_MAPPING_EXAMPLE } from './CalendarDataProcessor';
export { processCalendarData, validateCalendarData } from './CalendarDataProcessor';
export { CalendarRenderer } from './CalendarRenderer';
export { CalendarConfig } from './CalendarConfig';

// Utility functions
export function getRequiredColumns(config: CalendarChartConfig): string[] {
  return [config.dataMapping.dateColumn, config.dataMapping.valueColumn];
}

export function validateCsvForCalendar(csvData: string, config: CalendarChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const result = validateCalendarData(csvData, config);
  const lines = csvData.trim().split('\n');
  const headers = lines.length > 0 ? lines[0].split(',').map(h => h.trim().replace(/['"]/g, '')) : [];
  const requiredColumns = getRequiredColumns(config);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: result.valid && missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
} 