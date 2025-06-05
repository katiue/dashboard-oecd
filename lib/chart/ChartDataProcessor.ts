// Enhanced Chart Data Processor
// This module processes CSV data based on chart configurations to generate 
// properly formatted data for Nivo charts

import type { ChartConfig } from '@/lib/chart/ChartSchemas';

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
  if (typeof value === 'number') return value;
  const num = Number.parseFloat(value);
  return Number.isNaN(num) ? 0 : num;
}

// Bar Chart Data Processor
export function processBarChartData(csvData: string, config: Extract<ChartConfig, { chartType: 'bar' }>): any[] {
  const { headers, data } = parseCSV(csvData);
  const { indexBy, valueColumns } = config.dataMapping;
  
  if (!data.length || !headers.includes(indexBy)) return [];
  
  return data.map((row, index) => {
    const result: any = {
      [indexBy]: row[indexBy] || `item-${index}`
    };
    
    valueColumns.forEach(col => {
      if (headers.includes(col)) {
        result[col] = toNumber(row[col]);
      }
    });
    
    return result;
  });
}

// Line Chart Data Processor
export function processLineChartData(csvData: string, config: Extract<ChartConfig, { chartType: 'line' }>): any[] {
  const { headers, data } = parseCSV(csvData);
  const { xColumn, yColumns } = config.dataMapping;
  
  if (!data.length || !headers.includes(xColumn)) return [];
  
  return yColumns
    .filter(col => headers.includes(col))
    .map(yCol => ({
      id: yCol,
      data: data.map(row => ({
        x: row[xColumn] || 'unknown',
        y: toNumber(row[yCol])
      }))
    }));
}

// Pie Chart Data Processor
export function processPieChartData(csvData: string, config: Extract<ChartConfig, { chartType: 'pie' }>): any[] {
  const { headers, data } = parseCSV(csvData);
  const { idColumn, valueColumn } = config.dataMapping;
  
  if (!data.length || !headers.includes(idColumn) || !headers.includes(valueColumn)) return [];
  
  return data.map((row, index) => ({
    id: row[idColumn] || `slice-${index}`,
    label: row[idColumn] || `slice-${index}`,
    value: toNumber(row[valueColumn])
  }));
}

// Heatmap Data Processor
export function processHeatmapData(csvData: string, config: Extract<ChartConfig, { chartType: 'heatmap' }>): any[] {
  const { headers, data } = parseCSV(csvData);
  const { xColumn, yColumn, valueColumn } = config.dataMapping;
  
  if (!data.length || !headers.includes(xColumn) || !headers.includes(yColumn) || !headers.includes(valueColumn)) return [];
  
  // Group data by X values for heatmap format
  const grouped: Record<string, any> = {};
  
  data.forEach(row => {
    const xVal = row[xColumn] || 'unknown';
    const yVal = row[yColumn] || 'unknown';
    const value = toNumber(row[valueColumn]);
    
    if (!grouped[xVal]) {
      grouped[xVal] = { id: xVal };
    }
    grouped[xVal][yVal] = value;
  });
  
  return Object.values(grouped);
}

// Radar Chart Data Processor
export function processRadarData(csvData: string, config: Extract<ChartConfig, { chartType: 'radar' }>): any[] {
  const { headers, data } = parseCSV(csvData);
  const { indexBy, valueColumns } = config.dataMapping;
  
  if (!data.length || !headers.includes(indexBy)) return [];
  
  return data.map((row, index) => {
    const result: any = {
      [indexBy]: row[indexBy] || `entity-${index}`
    };
    
    valueColumns.forEach(col => {
      if (headers.includes(col)) {
        result[col] = toNumber(row[col]);
      }
    });
    
    return result;
  });
}

// Scatter Plot Data Processor
export function processScatterData(csvData: string, config: Extract<ChartConfig, { chartType: 'scatter' }>): any[] {
  const { headers, data } = parseCSV(csvData);
  const { seriesColumn, xColumn, yColumn, sizeColumn } = config.dataMapping;
  
  if (!data.length || !headers.includes(xColumn) || !headers.includes(yColumn)) return [];
  
  // If no series column, create a single series
  if (!seriesColumn || !headers.includes(seriesColumn)) {
    return [{
      id: 'data',
      data: data.map(row => {
        const point: any = {
          x: toNumber(row[xColumn]),
          y: toNumber(row[yColumn])
        };
        
        if (sizeColumn && headers.includes(sizeColumn)) {
          point.size = toNumber(row[sizeColumn]);
        }
        
        return point;
      })
    }];
  }
  
  // Group by series
  const seriesMap: Record<string, any[]> = {};
  
  data.forEach(row => {
    const series = row[seriesColumn] || 'default';
    if (!seriesMap[series]) {
      seriesMap[series] = [];
    }
    
    const point: any = {
      x: toNumber(row[xColumn]),
      y: toNumber(row[yColumn])
    };
    
    if (sizeColumn && headers.includes(sizeColumn)) {
      point.size = toNumber(row[sizeColumn]);
    }
    
    seriesMap[series].push(point);
  });
  
  return Object.entries(seriesMap).map(([seriesName, points]) => ({
    id: seriesName,
    data: points
  }));
}

// Area Bump Data Processor
export function processAreaBumpData(csvData: string, config: Extract<ChartConfig, { chartType: 'areaBump' }>): any[] {
  const { headers, data } = parseCSV(csvData);
  const { xColumn, seriesColumns } = config.dataMapping;
  
  if (!data.length || !headers.includes(xColumn)) return [];
  
  return seriesColumns
    .filter(col => headers.includes(col))
    .map(seriesCol => ({
      id: seriesCol,
      data: data.map(row => ({
        x: row[xColumn] || 'unknown',
        y: toNumber(row[seriesCol])
      }))
    }));
}

// Main processor function that routes to appropriate chart type processor
export function processChartData(csvData: string, chartConfig: ChartConfig): any[] {
  try {
    if (!csvData || !csvData.trim()) {
      console.warn('No CSV data provided to processChartData');
      return [];
    }
    
    switch (chartConfig.chartType) {
      case 'bar':
        return processBarChartData(csvData, chartConfig);
      case 'line':
        return processLineChartData(csvData, chartConfig);
      case 'pie':
        return processPieChartData(csvData, chartConfig);
      case 'heatmap':
        return processHeatmapData(csvData, chartConfig);
      case 'radar':
        return processRadarData(csvData, chartConfig);
      case 'scatter':
        return processScatterData(csvData, chartConfig);
      case 'areaBump':
        return processAreaBumpData(csvData, chartConfig);
      default:
        console.warn(`Unsupported chart type: ${(chartConfig as any).chartType}`);
        return [];
    }
  } catch (error) {
    console.error('Error processing chart data:', error);
    return [];
  }
}

// Utility function to get required columns for a chart configuration
export function getRequiredColumns(chartConfig: ChartConfig): string[] {
  const columns: string[] = [];
  
  switch (chartConfig.chartType) {
    case 'bar':
      columns.push(chartConfig.dataMapping.indexBy);
      columns.push(...chartConfig.dataMapping.valueColumns);
      break;
    case 'line':
      columns.push(chartConfig.dataMapping.xColumn);
      columns.push(...chartConfig.dataMapping.yColumns);
      break;
    case 'pie':
      columns.push(chartConfig.dataMapping.idColumn);
      columns.push(chartConfig.dataMapping.valueColumn);
      break;
    case 'heatmap':
      columns.push(chartConfig.dataMapping.xColumn);
      columns.push(chartConfig.dataMapping.yColumn);
      columns.push(chartConfig.dataMapping.valueColumn);
      break;
    case 'radar':
      columns.push(chartConfig.dataMapping.indexBy);
      columns.push(...chartConfig.dataMapping.valueColumns);
      break;
    case 'scatter':
      if (chartConfig.dataMapping.seriesColumn) {
        columns.push(chartConfig.dataMapping.seriesColumn);
      }
      columns.push(chartConfig.dataMapping.xColumn);
      columns.push(chartConfig.dataMapping.yColumn);
      if (chartConfig.dataMapping.sizeColumn) {
        columns.push(chartConfig.dataMapping.sizeColumn);
      }
      break;
    case 'areaBump':
      columns.push(chartConfig.dataMapping.xColumn);
      columns.push(...chartConfig.dataMapping.seriesColumns);
      break;
  }
  
  return columns;
}

// Utility function to validate if CSV has required columns
export function validateCsvForChart(csvData: string, chartConfig: ChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  const { headers } = parseCSV(csvData);
  const requiredColumns = getRequiredColumns(chartConfig);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    valid: missingColumns.length === 0,
    missingColumns,
    availableColumns: headers
  };
}
