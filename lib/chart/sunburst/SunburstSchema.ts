import type { BaseChartConfig } from '../shared/BaseSchemas';

// Sunburst Chart Configuration Interface
export interface SunburstChartConfig extends BaseChartConfig {
  chartType: 'sunburst';
  
  // Data mapping - Hierarchical structure
  dataMapping: {
    idColumn: string; // Column for node IDs (e.g., "id", "name", "category")
    parentColumn?: string; // Column for parent IDs (e.g., "parent", "group") - optional for flat data
    valueColumn: string; // Column for node values/sizes (e.g., "value", "size", "amount")
    categoryColumn?: string; // Optional category for grouping
  };
  
  // Sunburst-specific properties
  radius?: number; // 0.9 radius fills the available space
  innerRadius?: number; // 0 to 1 for donut-like appearance
  padAngle?: number; // 0 to 10 degrees between arcs
  cornerRadius?: number; // 0 to 10 for rounded corners
  
  // Colors
  inherit?: {
    from: 'parent' | 'child';
  };
  childColor?: string;
  
  // Labels
  enableArcLabels?: boolean;
  arcLabel?: string | 'id' | 'value' | 'formattedValue';
  arcLabelsSkipAngle?: number; // 0 to 45 degrees
  arcLabelsTextColor?: string;
  arcLabelsRadiusOffset?: number; // 0.5 to 2
  
  // Border
  borderWidth?: number; // 0 to 10
  borderColor?: string;
  
  // Interactivity
  isInteractive?: boolean;
  
  // Tooltip
  tooltip?: any;
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Sunburst charts display hierarchical data in concentric circles, perfect for showing nested categories and proportions.",
  example: {
    csvColumns: ["Level1", "Level2", "Level3", "Value"],
    dataMapping: {
      idColumn: "Level1",
      parentColumn: "Level2",
      valueColumn: "Value",
      categoryColumn: "Level3"
    },
    description: "Shows multi-level hierarchy radiating from center"
  }
}; 