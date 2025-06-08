import type { BaseChartConfig, AxisConfig, LegendConfig } from '../shared/BaseSchemas';

// Stream Chart Configuration Interface
export interface StreamChartConfig extends BaseChartConfig {
  chartType: 'stream';
  
  // Data mapping - Time series with multiple layers
  dataMapping: {
    xColumn: string; // Column for X-axis/time (e.g., "date", "year", "month")
    valueColumns: string[]; // Columns for different layers (e.g., ["sales", "marketing", "support"])
  };
  
  // Stream-specific properties
  offsetType?: 'expand' | 'diverging' | 'silhouette' | 'wiggle';
  order?: 'ascending' | 'descending' | 'insideOut' | 'none' | 'reverse';
  curve?: 'basis' | 'cardinal' | 'catmullRom' | 'linear' | 'monotoneX' | 'monotoneY' | 'natural' | 'step' | 'stepAfter' | 'stepBefore';
  
  // Fill and border
  fillOpacity?: number; // 0 to 1
  borderWidth?: number; // 0 to 20
  borderColor?: string;
  
  // Dots
  enableDots?: boolean;
  dotSize?: number; // 2 to 20
  dotColor?: string;
  dotBorderWidth?: number; // 0 to 10
  dotBorderColor?: string;
  
  // Stack tooltip
  enableStackTooltip?: boolean;
  
  // Axes
  axisTop?: AxisConfig | null;
  axisRight?: AxisConfig | null;
  axisBottom?: AxisConfig | null;
  axisLeft?: AxisConfig | null;
  
  // Legends
  legends?: LegendConfig[];
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Stream charts show flowing stacked areas over time, perfect for showing composition changes and trends.",
  example: {
    csvColumns: ["Month", "Product_A", "Product_B", "Product_C", "Product_D"],
    dataMapping: {
      xColumn: "Month",
      valueColumns: ["Product_A", "Product_B", "Product_C", "Product_D"]
    },
    description: "Shows product contribution flowing over months"
  }
}; 