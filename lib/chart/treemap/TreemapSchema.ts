import type { BaseChartConfig, LegendConfig } from '../shared/BaseSchemas';

// TreeMap Chart Configuration Interface
export interface TreemapChartConfig extends BaseChartConfig {
  chartType: 'treemap';
  
  // Data mapping - Hierarchical structure
  dataMapping: {
    idColumn: string; // Column for node IDs (e.g., "id", "name", "category")
    parentColumn?: string; // Column for parent IDs (e.g., "parent", "group") - optional for flat data
    valueColumn: string; // Column for node values/sizes (e.g., "value", "size", "amount")
    labelColumn?: string; // Optional column for custom labels
  };
  
  // TreeMap-specific properties
  tile?: 'binary' | 'squarify' | 'slice' | 'dice' | 'sliceDice';
  leavesOnly?: boolean; // Show only leaf nodes
  
  // Inner padding
  innerPadding?: number; // 0 to 10
  outerPadding?: number; // 0 to 10
  
  // Labels
  enableLabel?: boolean;
  label?: string | 'id' | 'value' | 'formattedValue';
  labelSkipSize?: number; // 0 to 100
  labelTextColor?: string;
  orientLabel?: boolean;
  
  // Parent labels
  enableParentLabel?: boolean;
  parentLabel?: string | 'id' | 'value' | 'formattedValue';
  parentLabelSize?: number; // 8 to 32
  parentLabelPosition?: 'top' | 'bottom' | 'left' | 'right';
  parentLabelPadding?: number; // 0 to 20
  parentLabelTextColor?: string;
  
  // Border
  borderWidth?: number; // 0 to 10
  borderColor?: string;
  
  // Node component
  nodeComponent?: string;
  
  // Legends
  legends?: LegendConfig[];
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "TreeMaps display hierarchical data as nested rectangles, with size representing values. Perfect for showing composition and hierarchy.",
  example: {
    csvColumns: ["Category", "Subcategory", "Value", "Label"],
    dataMapping: {
      idColumn: "Category",
      parentColumn: "Subcategory", 
      valueColumn: "Value",
      labelColumn: "Label"
    },
    description: "Shows category breakdown with subcategory hierarchy"
  }
}; 