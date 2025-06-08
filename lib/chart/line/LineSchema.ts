import type { BaseChartConfig, AxisConfig, LegendConfig } from '../shared/BaseSchemas';

// Line Chart Configuration Interface
export interface LineChartConfig extends BaseChartConfig {
  chartType: 'line';
  
  // Data mapping - X values with multiple Y series
  dataMapping: {
    xColumn: string; // Column for X-axis values (e.g., "date", "time", "category")
    yColumns: string[]; // Columns for Y values/lines (e.g., ["sales", "profit", "revenue"])
  };
  
  // Line-specific properties
  curve?: 'basis' | 'cardinal' | 'catmullRom' | 'linear' | 'monotoneX' | 'monotoneY' | 'natural' | 'step' | 'stepAfter' | 'stepBefore';
  lineWidth?: number; // 1 to 10
  
  // Scales
  xScale?: 
    | {
        type: 'linear';
        min?: number | 'auto';
        max?: number | 'auto';
        stacked?: boolean;
        reverse?: boolean;
      }
    | {
        type: 'point';
        padding?: number;
        reverse?: boolean;
      }
    | {
        type: 'time';
        min?: Date | 'auto';
        max?: Date | 'auto';
        useUTC?: boolean;
        precision?: 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
      };
  yScale?: {
    type: 'linear' | 'symlog';
    min?: number | 'auto';
    max?: number | 'auto';
    stacked?: boolean;
    reverse?: boolean;
  };
  
  // Points
  enablePoints?: boolean;
  pointSize?: number; // 4 to 20
  pointColor?: string;
  pointBorderWidth?: number; // 0 to 10
  pointBorderColor?: string;
  enablePointLabel?: boolean;
  pointLabel?: string;
  pointLabelYOffset?: number; // -12 to 12
  
  // Area under line
  enableArea?: boolean;
  areaOpacity?: number; // 0 to 1
  
  // Grid
  enableGridX?: boolean;
  enableGridY?: boolean;
  
  // Crosshair
  enableCrosshair?: boolean;
  crosshairType?: 'bottom-left' | 'bottom' | 'left' | 'top-left' | 'top' | 'top-right' | 'right' | 'bottom-right' | 'x' | 'y' | 'cross';
  
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
  description: "Line charts show trends over time or sequential data. Each Y column becomes a separate line series.",
  example: {
    csvColumns: ["Month", "Sales", "Profit", "Revenue", "Costs"],
    dataMapping: {
      xColumn: "Month",
      yColumns: ["Sales", "Profit", "Revenue"]
    },
    description: "Shows sales, profit, and revenue trends over months"
  }
}; 