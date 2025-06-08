// Scatter Chart Schema Definition
import { BaseChartConfig, AxisConfig, LegendConfig } from '../shared/BaseSchemas';

export interface ScatterPlotConfig extends BaseChartConfig {
  chartType: 'scatter';
  
  // Data mapping - X/Y coordinates with optional grouping
  dataMapping: {
    // Each series is a group of points
    seriesColumn?: string; // Optional column for grouping (e.g., "category", "species")
    xColumn: string; // Column for X values (e.g., "height", "price")
    yColumn: string; // Column for Y values (e.g., "weight", "rating")
    sizeColumn?: string; // Optional column for point size (e.g., "population", "sales")
  };
  
  // Scatter-specific properties
  nodeSize?: number | { from: number; to: number }; // 4 to 64 or dynamic range
  
  // Scales
  xScale?: {
    type: 'linear' | 'log' | 'symlog' | 'time';
    min?: number | 'auto';
    max?: number | 'auto';
  };
  yScale?: {
    type: 'linear' | 'log' | 'symlog' | 'time';  
    min?: number | 'auto';
    max?: number | 'auto';
  };
  
  // Axes
  axisTop?: AxisConfig | null;
  axisRight?: AxisConfig | null;
  axisBottom?: AxisConfig | null;
  axisLeft?: AxisConfig | null;
  
  // Grid
  enableGridX?: boolean;
  enableGridY?: boolean;
  
  // Mesh (for better hover detection)
  useMesh?: boolean;
  debugMesh?: boolean;
  
  // Legends
  legends?: LegendConfig[];
}

export const DATA_MAPPING_EXAMPLE = {
  description: "For scatter plots, specify X and Y value columns, optionally group by series and size by another column",
  example: {
    xColumn: "height", // Use height for X-axis
    yColumn: "weight", // Use weight for Y-axis
    seriesColumn: "species", // Optional: group points by species
    sizeColumn: "age" // Optional: make point size represent age
  }
}; 