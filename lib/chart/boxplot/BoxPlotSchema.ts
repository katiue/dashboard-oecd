import type { BaseChartConfig, AxisConfig, LegendConfig } from '../shared/BaseSchemas';

// Box Plot Chart Configuration Interface
export interface BoxPlotChartConfig extends BaseChartConfig {
  chartType: 'boxplot';
  
  // Data mapping - Grouping and value columns
  dataMapping: {
    groupBy: string; // Column for grouping (e.g., "category", "group")
    value: string; // Column for numeric values (e.g., "score", "price")
    subGroup?: string; // Optional sub-grouping column
  };
  
  // Box plot specific properties
  groupSpacing?: number; // 0 to 1
  boxSpacing?: number; // 0 to 1
  borderRadius?: number; // 0 to 10
  borderWidth?: number; // 0 to 10
  borderColor?: string;
  
  // Outliers
  enableOutliers?: boolean;
  outlierSize?: number; // 4 to 20
  outlierColor?: string;
  
  // Whiskers
  whiskerWidth?: number; // 0 to 1
  whiskerColor?: string;
  
  // Median
  medianWidth?: number; // 0 to 1
  medianColor?: string;
  
  // Quantiles
  quantiles?: [number, number, number, number, number]; // [min, q1, median, q3, max]
  
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
  description: "Box plots show the distribution of values through quartiles and outliers for different groups.",
  example: {
    csvColumns: ["Category", "Score", "Group", "Region"],
    dataMapping: {
      groupBy: "Category",
      value: "Score",
      subGroup: "Group"
    },
    description: "Shows score distribution by category with optional sub-grouping"
  }
}; 