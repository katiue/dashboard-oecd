import type { BaseChartConfig, LegendConfig } from '../shared/BaseSchemas';

// Network Chart Configuration Interface
export interface NetworkChartConfig extends BaseChartConfig {
  chartType: 'network';
  
  // Data mapping - Nodes and links structure
  dataMapping: {
    // For nodes data
    nodeIdColumn: string; // Column for node IDs (e.g., "id", "name")
    nodeGroupColumn?: string; // Optional column for node grouping/coloring
    nodeSizeColumn?: string; // Optional column for node size
    
    // For links data (separate CSV or same CSV with from/to columns)
    linkSourceColumn?: string; // Column for link source nodes (e.g., "from", "source")
    linkTargetColumn?: string; // Column for link target nodes (e.g., "to", "target")
    linkValueColumn?: string; // Optional column for link weights/values
  };
  
  // Layout properties
  iterations?: number; // 60 to 300 - simulation iterations
  repulsivity?: number; // 1 to 100 - node repulsion force
  distanceMin?: number; // 1 to 100 - minimum distance between nodes
  distanceMax?: number; // 100 to 500 - maximum distance for links
  
  // Nodes
  nodeSize?: number | { from: number; to: number }; // 6 to 64 or dynamic range
  nodeColor?: string;
  nodeBorderWidth?: number; // 0 to 10
  nodeBorderColor?: string;
  
  // Links
  linkThickness?: number | { from: number; to: number }; // 1 to 20 or dynamic range
  linkColor?: string;
  
  // Labels
  enableLabels?: boolean;
  labelProperty?: string; // Property to use for labels
  labelSkipRadius?: number; // 0 to 32
  labelTextColor?: string;
  
  // Annotations
  annotations?: any[];
  
  // Legends
  legends?: LegendConfig[];
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Network charts display relationships between entities as nodes and links, perfect for social networks, dependencies, or flow diagrams.",
  example: {
    csvColumns: ["Node_ID", "Group", "Size", "Source", "Target", "Weight"],
    dataMapping: {
      nodeIdColumn: "Node_ID",
      nodeGroupColumn: "Group",
      nodeSizeColumn: "Size",
      linkSourceColumn: "Source",
      linkTargetColumn: "Target",
      linkValueColumn: "Weight"
    },
    description: "Shows network relationships with grouped nodes and weighted connections"
  }
}; 