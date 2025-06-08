import type { BaseChartConfig, LegendConfig } from '../shared/BaseSchemas';

// Radar Chart Configuration Interface
export interface RadarChartConfig extends BaseChartConfig {
  chartType: 'radar';
  
  // Data mapping - Multiple dimensions per entity
  dataMapping: {
    indexBy: string; // Column for entity names (e.g., "player", "product", "team")
    valueColumns: string[]; // Columns for dimension values (e.g., ["speed", "strength", "agility"])
  };
  
  // Radar-specific properties
  maxValue?: number | 'auto';
  curve?: 'linearClosed' | 'basisClosed' | 'cardinalClosed' | 'catmullRomClosed';
  
  // Grid properties
  gridLevels?: number; // 3 to 8
  gridShape?: 'circular' | 'linear';
  gridLabelOffset?: number; // 6 to 60
  
  // Dots
  enableDots?: boolean;
  dotSize?: number; // 4 to 32
  dotColor?: string;
  dotBorderWidth?: number; // 0 to 10
  dotBorderColor?: string;
  enableDotLabel?: boolean;
  dotLabel?: string;
  dotLabelYOffset?: number; // -12 to 12
  
  // Fill and blend
  fillOpacity?: number; // 0 to 1
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';
  
  // Legends
  legends?: LegendConfig[];
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Radar charts show multi-dimensional data as overlapping polygons, perfect for comparing entities across multiple metrics.",
  example: {
    csvColumns: ["Player", "Speed", "Strength", "Agility", "Defense", "Attack"],
    dataMapping: {
      indexBy: "Player",
      valueColumns: ["Speed", "Strength", "Agility", "Defense", "Attack"]
    },
    description: "Shows player attributes across multiple performance dimensions"
  }
}; 