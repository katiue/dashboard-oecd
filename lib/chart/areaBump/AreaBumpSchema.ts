import type { BaseChartConfig, AxisConfig } from '../shared/BaseSchemas';

// Area Bump Chart Configuration Interface
export interface AreaBumpChartConfig extends BaseChartConfig {
  chartType: 'areaBump';
  
  // Data mapping - Time series with multiple categories
  dataMapping: {
    xColumn: string; // Column for time/sequence (e.g., "year", "month", "day")
    seriesColumns: string[]; // Columns representing different series (e.g., ["brand_a", "brand_b", "brand_c"])
  };
  
  // Area bump specific properties
  align?: 'start' | 'middle' | 'end';
  interpolation?: 'smooth' | 'linear';
  spacing?: number; // 0 to 32
  xPadding?: number; // 0 to 1
  
  // Start/End labels
  startLabel?: boolean;
  startLabelPadding?: number; // 0 to 32
  startLabelTextColor?: string;
  endLabel?: boolean;
  endLabelPadding?: number; // 0 to 32
  endLabelTextColor?: string;
  
  // Axes
  axisTop?: AxisConfig | null;
  axisBottom?: AxisConfig | null;
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Area bump charts show ranking changes over time with filled areas representing different categories.",
  example: {
    csvColumns: ["Year", "CompanyA", "CompanyB", "CompanyC", "CompanyD"],
    dataMapping: {
      xColumn: "Year",
      seriesColumns: ["CompanyA", "CompanyB", "CompanyC", "CompanyD"]
    },
    description: "Shows market share evolution of companies over years"
  }
}; 