import type { BaseChartConfig, LegendConfig } from '../shared/BaseSchemas';

// Waffle Chart Configuration Interface
export interface WaffleChartConfig extends BaseChartConfig {
  chartType: 'waffle';
  
  // Data mapping - Categorical proportions
  dataMapping: {
    idColumn: string; // Column for category names (e.g., "category", "product", "type")
    valueColumn: string; // Column for values/counts (e.g., "count", "percentage", "value")
  };
  
  // Waffle-specific properties
  total?: number; // Total number of squares (e.g., 100 for percentages)
  rows?: number; // Number of rows in the grid (auto-calculated if not specified)
  columns?: number; // Number of columns in the grid
  
  // Fill direction
  fillDirection?: 'top' | 'right' | 'bottom' | 'left';
  padding?: number; // 0 to 10 - padding between squares
  
  // Squares
  cellComponent?: string;
  
  // Borders
  borderRadius?: number; // 0 to 10
  borderWidth?: number; // 0 to 10
  borderColor?: string;
  
  // Legends
  legends?: LegendConfig[];
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Waffle charts display proportions as filled squares in a grid, making percentages easy to visualize (each square = 1%).",
  example: {
    csvColumns: ["Category", "Percentage"],
    dataMapping: {
      idColumn: "Category",
      valueColumn: "Percentage"
    },
    description: "Shows category distribution with each square representing 1% of the total"
  }
}; 