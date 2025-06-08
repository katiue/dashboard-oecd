import type { BaseChartConfig } from '../shared/BaseSchemas';

// Sankey Chart Configuration Interface
export interface SankeyChartConfig extends BaseChartConfig {
  chartType: 'sankey';
  
  // Data mapping - Source-Target-Value structure
  dataMapping: {
    sourceColumn: string; // Column for source nodes (e.g., "from", "source")
    targetColumn: string; // Column for target nodes (e.g., "to", "target", "destination")
    valueColumn: string; // Column for flow values (e.g., "value", "amount", "flow")
    categoryColumn?: string; // Optional category for node grouping
  };
  
  // Layout properties
  align?: 'center' | 'justify' | 'left' | 'right';
  sort?: 'auto' | 'input' | 'ascending' | 'descending';
  
  // Node properties
  nodeOpacity?: number; // 0 to 1
  nodeHoverOpacity?: number; // 0 to 1
  nodeHoverOthersOpacity?: number; // 0 to 1
  nodeThickness?: number; // 10 to 60
  nodeSpacing?: number; // 0 to 60
  nodeInnerPadding?: number; // 0 to 10
  nodeBorderWidth?: number; // 0 to 10
  nodeBorderColor?: string;
  nodeBorderRadius?: number; // 0 to 16
  
  // Link properties
  linkOpacity?: number; // 0 to 1
  linkHoverOpacity?: number; // 0 to 1
  linkHoverOthersOpacity?: number; // 0 to 1
  linkContract?: number; // 0 to 60
  linkBlendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';
  enableLinkGradient?: boolean;
  
  // Labels
  enableLabels?: boolean;
  label?: string | 'id' | 'value';
  labelPosition?: 'inside' | 'outside';
  labelPadding?: number; // 0 to 32
  labelTextColor?: string;
  labelOrientation?: 'horizontal' | 'vertical';
  
  // Iterations for layout algorithm
  iterations?: number; // 32 to 240
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Sankey diagrams show flows between nodes. Data should contain source-target-value triplets representing connections and their magnitudes.",
  example: {
    csvColumns: ["Source", "Target", "Value", "Category"],
    dataMapping: {
      sourceColumn: "Source",
      targetColumn: "Target",
      valueColumn: "Value"
    },
    description: "Shows flow from source to target with flow magnitude"
  },
  useCases: [
    "Budget flows and allocations",
    "Energy consumption and sources",
    "Website user journeys",
    "Supply chain flows",
    "Migration patterns"
  ]
}; 