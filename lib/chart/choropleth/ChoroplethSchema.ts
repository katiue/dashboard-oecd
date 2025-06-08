import type { BaseChartConfig, LegendConfig } from '../shared/BaseSchemas';

// Choropleth Chart Configuration Interface
export interface ChoroplethChartConfig extends BaseChartConfig {
  chartType: 'choropleth';
  
  // Data mapping - Geographic data
  dataMapping: {
    idColumn: string; // Column for geographic IDs (e.g., "country_code", "state_id", "region")
    valueColumn: string; // Column for values to color-code (e.g., "population", "gdp", "cases")
    labelColumn?: string; // Optional column for labels
  };
  
  // Geographic properties
  features: any[]; // GeoJSON features for the map
  projectionType?: 'mercator' | 'geoOrthographic' | 'geoStereographic' | 'geoAzimuthalEqualArea';
  projectionRotation?: [number, number, number]; // [lambda, phi, gamma]
  projectionScale?: number; // Zoom level
  
  // Choropleth-specific properties
  unknownColor?: string; // Color for missing/unknown data
  domain?: [number, number]; // Value domain for color scale
  
  // Boundaries
  enableGraticule?: boolean; // Show latitude/longitude grid
  borderWidth?: number; // 0 to 10
  borderColor?: string;
  
  // Legends
  legends?: LegendConfig[];
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Choropleth charts display geographic data with regions colored by data values, perfect for showing spatial patterns and distributions.",
  example: {
    csvColumns: ["Country_Code", "Population", "Country_Name"],
    dataMapping: {
      idColumn: "Country_Code",
      valueColumn: "Population",
      labelColumn: "Country_Name"
    },
    description: "Shows population data colored by country on a world map"
  }
}; 