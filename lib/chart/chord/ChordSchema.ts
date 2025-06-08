import type { BaseChartConfig } from '../shared/BaseSchemas';

// Chord Chart Configuration Interface
export interface ChordChartConfig extends BaseChartConfig {
  chartType: 'chord';
  
  // Data mapping - Matrix data for relationships
  dataMapping: {
    matrix: string[][]; // Matrix of relationships or CSV with from/to/value structure
    fromColumn?: string; // Column for source nodes (when using CSV)
    toColumn?: string; // Column for target nodes (when using CSV)
    valueColumn?: string; // Column for relationship values (when using CSV)
    keys?: string[]; // Labels for matrix rows/columns
  };
  
  // Chord specific properties
  padAngle?: number; // 0 to 0.2 radians
  innerRadiusRatio?: number; // 0 to 1
  innerRadiusOffset?: number; // 0 to 50
  
  // Arcs (outer rings)
  arcOpacity?: number; // 0 to 1
  arcBorderWidth?: number; // 0 to 10
  arcBorderColor?: string;
  
  // Ribbons (connections)
  ribbonOpacity?: number; // 0 to 1
  ribbonBorderWidth?: number; // 0 to 10
  ribbonBorderColor?: string;
  
  // Labels
  enableLabel?: boolean;
  label?: string | 'id' | 'value';
  labelOffset?: number; // 6 to 36
  labelRotation?: number; // -180 to 180
  labelTextColor?: string;
  
  // Interaction
  isInteractive?: boolean;
  arcHoverOpacity?: number; // 0 to 1
  arcHoverOthersOpacity?: number; // 0 to 1
  ribbonHoverOpacity?: number; // 0 to 1
  ribbonHoverOthersOpacity?: number; // 0 to 1
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Chord diagrams show relationships between entities using curved ribbons. Data can be provided as a matrix or as from/to/value CSV format.",
  example: {
    csvColumns: ["From", "To", "Value", "Category"],
    dataMapping: {
      fromColumn: "From",
      toColumn: "To",
      valueColumn: "Value"
    },
    description: "Shows relationships between entities with connection strength"
  },
  matrixExample: {
    matrix: [
      [0, 5, 6, 4, 7, 4],
      [1, 0, 4, 2, 2, 3],
      [5, 4, 0, 3, 6, 1],
      [7, 3, 4, 0, 1, 2],
      [6, 1, 9, 1, 0, 8],
      [2, 2, 6, 6, 1, 0]
    ],
    keys: ["Group A", "Group B", "Group C", "Group D", "Group E", "Group F"]
  }
}; 