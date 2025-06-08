import type { BaseChartConfig, LegendConfig } from '../shared/BaseSchemas';

// Radial Bar Chart Configuration Interface
export interface RadialBarChartConfig extends BaseChartConfig {
  chartType: 'radialbar';
  
  // Data mapping - Categorical data in circular form
  dataMapping: {
    idColumn: string; // Column for category names (e.g., "category", "product", "metric")
    valueColumn: string; // Column for values (e.g., "value", "score", "amount")
  };
  
  // Radial properties
  maxValue?: number | 'auto'; // Maximum value for the scale
  startAngle?: number; // -180 to 180 degrees - where to start drawing
  endAngle?: number; // -180 to 180 degrees - where to end drawing
  innerRadius?: number; // 0 to 1 - inner radius (0 = full circle, >0 = donut)
  padding?: number; // 0 to 1 - padding between bars
  padAngle?: number; // 0 to 45 degrees - angle padding between bars
  cornerRadius?: number; // 0 to 50 - corner radius of bars
  
  // Tracks
  enableTracks?: boolean; // Show background tracks
  tracksColor?: string;
  
  // Grid
  enableRadialGrid?: boolean; // Show radial grid lines
  enableCircularGrid?: boolean; // Show circular grid lines
  
  // Labels
  enableLabels?: boolean;
  label?: string | 'id' | 'value' | 'formattedValue';
  labelsSkipAngle?: number; // 0 to 45 degrees
  labelsRadiusOffset?: number; // 0 to 2
  labelsTextColor?: string;
  
  // Legends
  legends?: LegendConfig[];
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Radial bar charts display data in a circular format, perfect for cyclical data or when you want a more visually striking presentation.",
  example: {
    csvColumns: ["Month", "Sales", "Target"],
    dataMapping: {
      idColumn: "Month",
      valueColumn: "Sales"
    },
    description: "Shows monthly sales in a circular bar chart format"
  }
}; 