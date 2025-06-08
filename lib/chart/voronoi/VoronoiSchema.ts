import type { BaseChartConfig, LegendConfig } from '../shared/BaseSchemas';

// Voronoi Chart Configuration Interface
export interface VoronoiChartConfig extends BaseChartConfig {
  chartType: 'voronoi';
  
  // Data mapping - Spatial points
  dataMapping: {
    idColumn?: string; // Optional column for point IDs (e.g., "id", "name")
    xColumn: string; // Column for X coordinates (e.g., "x", "longitude")
    yColumn: string; // Column for Y coordinates (e.g., "y", "latitude")
    weightColumn?: string; // Optional column for point weights
  };
  
  // Voronoi-specific properties
  enableSites?: boolean; // Show the original points
  siteSize?: number; // 2 to 20 - size of site points
  siteColor?: string;
  
  // Cells
  enableCells?: boolean; // Show voronoi cells
  cellOpacity?: number; // 0 to 1
  
  // Links (Delaunay triangulation)
  enableLinks?: boolean; // Show delaunay triangulation
  linkOpacity?: number; // 0 to 1
  linkColor?: string;
  
  // Mesh
  enableMesh?: boolean; // Show mesh overlay
  meshOpacity?: number; // 0 to 1
  meshColor?: string;
  
  // Bounds
  xDomain?: [number, number]; // X axis bounds
  yDomain?: [number, number]; // Y axis bounds
  
  // Legends
  legends?: LegendConfig[];
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Voronoi diagrams partition space based on proximity to points, useful for spatial analysis and territorial visualization.",
  example: {
    csvColumns: ["Store_ID", "Longitude", "Latitude", "Sales"],
    dataMapping: {
      idColumn: "Store_ID",
      xColumn: "Longitude",
      yColumn: "Latitude",
      weightColumn: "Sales"
    },
    description: "Shows store territories based on location with sales-weighted influence"
  }
}; 