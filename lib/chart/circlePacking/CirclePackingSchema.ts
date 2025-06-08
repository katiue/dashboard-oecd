import type { BaseChartConfig } from '../shared/BaseSchemas';

// Circle Packing Chart Configuration Interface
export interface CirclePackingChartConfig extends BaseChartConfig {
  chartType: 'circlePacking';
  
  // Data mapping - Hierarchical structure
  dataMapping: {
    idColumn: string; // Column for node IDs (e.g., "id", "name")
    parentColumn?: string; // Column for parent IDs (e.g., "parent", "group") - optional for flat data
    valueColumn: string; // Column for node values/sizes (e.g., "value", "size", "count")
    categoryColumn?: string; // Optional category for grouping (e.g., "category", "type")
  };
  
  // Circle packing specific properties
  padding?: number; // 1 to 10
  leavesOnly?: boolean; // Show only leaf nodes
  
  // Colors
  inherit?: {
    from: 'parent' | 'child';
  };
  
  // Labels
  enableLabels?: boolean;
  label?: string | 'id' | 'value';
  labelsFilter?: (node: any) => boolean;
  labelsSkipRadius?: number; // 0 to 32
  labelTextColor?: string;
  
  // Border
  borderWidth?: number; // 0 to 10
  borderColor?: string;
  
  // Circle properties
  circleComponent?: string;
  
  // Zoom
  isZoomable?: boolean;
  zoomOnClick?: boolean;
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Circle packing displays hierarchical data as nested circles. Each circle size represents a value, and circles can be nested to show hierarchy.",
  example: {
    csvColumns: ["ID", "Parent", "Value", "Category", "Name"],
    dataMapping: {
      idColumn: "ID",
      parentColumn: "Parent",
      valueColumn: "Value",
      categoryColumn: "Category"
    },
    description: "Shows hierarchical data with circle sizes representing values"
  },
  flatExample: {
    csvColumns: ["Name", "Value", "Group"],
    dataMapping: {
      idColumn: "Name",
      valueColumn: "Value",
      categoryColumn: "Group"
    },
    description: "Shows flat data grouped by category, useful for comparing values within groups"
  }
}; 