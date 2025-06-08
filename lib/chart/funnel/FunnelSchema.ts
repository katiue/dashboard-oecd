import type { BaseChartConfig, LegendConfig } from '../shared/BaseSchemas';

// Funnel Chart Configuration Interface
export interface FunnelChartConfig extends BaseChartConfig {
  chartType: 'funnel';
  
  // Data mapping - Steps in the funnel
  dataMapping: {
    idColumn: string; // Column for step names (e.g., "step", "stage", "phase")
    valueColumn: string; // Column for step values (e.g., "users", "conversions", "count")
    labelColumn?: string; // Optional column for custom labels
  };
  
  // Funnel properties
  direction?: 'top' | 'bottom';
  spacing?: number; // 0 to 20
  shapeBlending?: number; // 0 to 1
  beforeSeparatorLength?: number; // 0 to 100
  beforeSeparatorOffset?: number; // 0 to 100
  afterSeparatorLength?: number; // 0 to 100
  afterSeparatorOffset?: number; // 0 to 100
  
  // Labels
  enableLabel?: boolean;
  labelColor?: string;
  
  // Border
  borderWidth?: number; // 0 to 10
  borderColor?: string;
  borderOpacity?: number; // 0 to 1
  
  // Interactivity
  isInteractive?: boolean;
  currentPartSizeExtension?: number; // 0 to 100
  currentBorderWidth?: number; // 0 to 10
  
  // Legends
  legends?: LegendConfig[];
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Funnel charts show conversion flow through sequential steps, perfect for sales pipelines or user journeys.",
  example: {
    csvColumns: ["Stage", "Users", "Label"],
    dataMapping: {
      idColumn: "Stage",
      valueColumn: "Users",
      labelColumn: "Label"
    },
    description: "Shows user conversion through different stages of a process"
  }
}; 