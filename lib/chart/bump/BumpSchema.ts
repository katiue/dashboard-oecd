import type { BaseChartConfig, AxisConfig, LegendConfig } from '../shared/BaseSchemas';

// Bump Chart Configuration Interface
export interface BumpChartConfig extends BaseChartConfig {
  chartType: 'bump';
  
  // Data mapping - Series ranking over time
  dataMapping: {
    xColumn: string; // Column for X-axis (e.g., "year", "month", "week")
    seriesColumns: string[]; // Columns for different series (e.g., ["team_a", "team_b", "team_c"])
  };
  
  // Bump-specific properties
  interpolation?: 'smooth' | 'linear';
  xPadding?: number; // 0 to 1
  lineWidth?: number; // 1 to 20
  
  // Points
  pointSize?: number; // 4 to 20
  pointColor?: string;
  pointBorderWidth?: number; // 0 to 10
  pointBorderColor?: string;
  
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
  axisLeft?: AxisConfig | null;
  axisRight?: AxisConfig | null;
  
  // Legends
  legends?: LegendConfig[];
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Bump charts show ranking changes over time with lines connecting points. Lower numbers indicate better ranks.",
  example: {
    csvColumns: ["Year", "TeamA_Rank", "TeamB_Rank", "TeamC_Rank", "TeamD_Rank"],
    dataMapping: {
      xColumn: "Year",
      seriesColumns: ["TeamA_Rank", "TeamB_Rank", "TeamC_Rank", "TeamD_Rank"]
    },
    description: "Shows team ranking changes over years (1=best rank)"
  }
}; 