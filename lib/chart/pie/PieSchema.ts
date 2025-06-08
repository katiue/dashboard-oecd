import type { BaseChartConfig, LegendConfig } from '../shared/BaseSchemas';

// Pie Chart Configuration Interface
export interface PieChartConfig extends BaseChartConfig {
  chartType: 'pie';
  
  // Data mapping - ID/Label and value
  dataMapping: {
    idColumn: string; // Column for slice labels (e.g., "category", "product", "region")
    valueColumn: string; // Column for slice values (e.g., "sales", "count", "percentage")
  };
  
  // Pie-specific properties
  innerRadius?: number; // 0 to 0.9 (0 = full pie, >0 = donut)
  padAngle?: number; // 0 to 10 degrees
  cornerRadius?: number; // 0 to 10 pixels
  
  // Start and end angles
  startAngle?: number; // 0 to 360 degrees
  endAngle?: number; // 0 to 360 degrees
  
  // Colors
  sortByValue?: boolean;
  
  // Border
  borderWidth?: number; // 0 to 10
  borderColor?: string;
  
  // Arc labels
  enableArcLabels?: boolean;
  arcLabel?: string | 'id' | 'value' | 'formattedValue';
  arcLabelsSkipAngle?: number; // 0 to 45 degrees
  arcLabelsTextColor?: string;
  arcLabelsRadiusOffset?: number; // 0.1 to 2
  
  // Arc link labels (external labels)
  enableArcLinkLabels?: boolean;
  arcLinkLabel?: string | 'id' | 'value' | 'formattedValue';
  arcLinkLabelsSkipAngle?: number; // 0 to 45 degrees
  arcLinkLabelsTextColor?: string;
  arcLinkLabelsThickness?: number; // 1 to 10
  arcLinkLabelsColor?: string;
  arcLinkLabelsOffset?: number; // -10 to 24
  arcLinkLabelsDiagonalLength?: number; // 0 to 36
  arcLinkLabelsStraightLength?: number; // 0 to 36
  
  // Legends
  legends?: LegendConfig[];
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Pie charts show part-to-whole relationships in categorical data. Each category becomes a slice with size proportional to its value.",
  example: {
    csvColumns: ["Category", "Sales", "Quantity", "Region"],
    dataMapping: {
      idColumn: "Category",
      valueColumn: "Sales"
    },
    description: "Shows sales distribution across product categories"
  }
}; 