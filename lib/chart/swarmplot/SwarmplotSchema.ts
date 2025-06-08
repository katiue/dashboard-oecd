import type { BaseChartConfig, AxisConfig, LegendConfig } from '../shared/BaseSchemas';

// SwarmPlot Chart Configuration Interface
export interface SwarmplotChartConfig extends BaseChartConfig {
  chartType: 'swarmplot';
  
  // Data mapping - Categorical distribution
  dataMapping: {
    groupBy: string; // Column for grouping (e.g., "category", "group", "class")
    value: string; // Column for numeric values (e.g., "score", "price", "measurement")
    size?: string; // Optional column for point size
    id?: string; // Optional column for point identification
  };
  
  // SwarmPlot-specific properties
  layout?: 'horizontal' | 'vertical';
  gap?: number; // 0 to 100 - gap between groups
  forceStrength?: number; // 0 to 10 - simulation force
  simulationIterations?: number; // 60 to 300
  
  // Node properties
  size?: number | { from: number; to: number }; // 4 to 64 or dynamic range
  spacing?: number; // 0 to 20
  
  // Colors and grouping
  groupBy?: string;
  groups?: string[];
  
  // Axes
  axisTop?: AxisConfig | null;
  axisRight?: AxisConfig | null;
  axisBottom?: AxisConfig | null;
  axisLeft?: AxisConfig | null;
  
  // Annotations
  annotations?: any[];
  
  // Legends
  legends?: LegendConfig[];
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "SwarmPlots show individual data points distributed to avoid overlap, perfect for showing distributions within categories.",
  example: {
    csvColumns: ["Species", "Measurement", "Weight", "ID"],
    dataMapping: {
      groupBy: "Species",
      value: "Measurement",
      size: "Weight",
      id: "ID"
    },
    description: "Shows measurement distribution across species with variable point sizes"
  }
}; 