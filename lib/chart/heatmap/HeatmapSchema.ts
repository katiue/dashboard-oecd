import type { BaseChartConfig, AxisConfig } from '../shared/BaseSchemas';

// Heatmap Chart Configuration Interface
export interface HeatmapChartConfig extends BaseChartConfig {
  chartType: 'heatmap';
  
  // Data mapping - Two dimensions with intensity values
  dataMapping: {
    xColumn: string; // Column for X-axis categories (e.g., "day", "category", "hour")
    yColumn: string; // Column for Y-axis categories (e.g., "time", "category", "region")
    valueColumn: string; // Column for intensity values (e.g., "temperature", "count", "sales")
  };
  
  // Cell properties
  enableLabels?: boolean;
  forceSquare?: boolean;
  sizeVariation?: false | { from: number; to: number };
  cellOpacity?: number; // 0 to 1
  cellBorderWidth?: number; // 0 to 10
  cellBorderColor?: string;
  
  // Label properties
  labelTextColor?: string;
  
  // Color scale
  colorScale?: {
    type: 'quantize' | 'linear' | 'symlog';
    scheme?: 'blues' | 'greens' | 'reds' | 'oranges' | 'purples' | 'viridis' | 'plasma' | 'inferno' | 'magma' | 'cividis';
    min?: number | 'auto';
    max?: number | 'auto';
    reverse?: boolean;
  };
  
  // Axes
  axisTop?: AxisConfig | null;
  axisRight?: AxisConfig | null;
  axisBottom?: AxisConfig | null;
  axisLeft?: AxisConfig | null;
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Heatmaps visualize data intensity across two categorical dimensions using color intensity.",
  example: {
    csvColumns: ["Day", "Hour", "Temperature", "Region"],
    dataMapping: {
      xColumn: "Day",
      yColumn: "Hour", 
      valueColumn: "Temperature"
    },
    description: "Shows temperature patterns by day and hour with color intensity"
  }
}; 