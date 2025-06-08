// Heatmap Chart Module - Simplified
import type { BaseChartConfig, AxisConfig } from '../shared/BaseSchemas';

export interface HeatmapChartConfig extends BaseChartConfig {
  chartType: 'heatmap';
  dataMapping: {
    xColumn: string;
    yColumn: string;
    valueColumn: string;
  };
  enableLabels?: boolean;
  forceSquare?: boolean;
  axisTop?: AxisConfig | null;
  axisRight?: AxisConfig | null;
  axisBottom?: AxisConfig | null;
  axisLeft?: AxisConfig | null;
}

export const DATA_MAPPING_EXAMPLE = {
  description: "Heatmaps visualize data intensity across two categorical dimensions.",
  example: {
    csvColumns: ["Day", "Hour", "Temperature", "Region"],
    dataMapping: {
      xColumn: "Day",
      yColumn: "Hour", 
      valueColumn: "Temperature"
    },
    description: "Shows temperature patterns by day and hour"
  }
};

export function processHeatmapData(csvData: string, config: HeatmapChartConfig): any[] {
  return [];
}

export function getRequiredColumns(config: HeatmapChartConfig): string[] {
  return [config.dataMapping.xColumn, config.dataMapping.yColumn, config.dataMapping.valueColumn];
}

export function validateCsvForHeatmap(csvData: string, config: HeatmapChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  return { valid: true, missingColumns: [], availableColumns: [] };
}

export { HeatmapRenderer } from './HeatmapRenderer';
export { HeatmapConfig } from './HeatmapConfig'; 