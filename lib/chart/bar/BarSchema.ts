import type { BaseChartConfig, AxisConfig, LegendConfig } from '../shared/BaseSchemas';

// Bar Chart Configuration Interface
export interface BarChartConfig extends BaseChartConfig {
  chartType: 'bar';
  
  // Data mapping - Categories with multiple values
  dataMapping: {
    indexBy: string; // Column for categories (e.g., "product", "month", "region")
    valueColumns: string[]; // Columns for numeric values (e.g., ["sales", "profit", "cost"])
  };
  
  // Bar-specific properties
  layout?: 'vertical' | 'horizontal';
  groupMode?: 'stacked' | 'grouped';
  padding?: number; // 0.1 to 0.9
  innerPadding?: number; // 0 to 10
  
  // Value scale
  valueScale?: {
    type: 'linear' | 'symlog';
    min?: number | 'auto';
    max?: number | 'auto';
    stacked?: boolean;
    reverse?: boolean;
  };
  
  // Labels
  enableLabel?: boolean;
  label?: string | 'value' | 'formattedValue';
  labelSkipWidth?: number; // 0 to infinity
  labelSkipHeight?: number; // 0 to infinity  
  labelTextColor?: string;
  
  // Grid
  enableGridX?: boolean;
  enableGridY?: boolean;
  
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
  description: "Bar charts display categorical data with rectangular bars. Each category (indexBy) can have multiple values (valueColumns) shown as grouped or stacked bars.",
  example: {
    csvColumns: ["Product", "Q1_Sales", "Q2_Sales", "Q3_Sales", "Q4_Sales"],
    dataMapping: {
      indexBy: "Product",
      valueColumns: ["Q1_Sales", "Q2_Sales", "Q3_Sales", "Q4_Sales"]
    },
    description: "Shows quarterly sales by product, with each quarter as a separate bar or stack segment"
  }
}; 