import type { BaseChartConfig } from '../shared/BaseSchemas';

// Bullet Chart Configuration Interface
export interface BulletChartConfig extends BaseChartConfig {
  chartType: 'bullet';
  
  // Data mapping - Performance metrics
  dataMapping: {
    idColumn: string; // Column for metric names (e.g., "metric", "kpi", "measurement")
    actualColumn: string; // Column for actual values (e.g., "actual", "current")
    targetColumn?: string; // Column for target values (e.g., "target", "goal")
    rangeColumns?: string[]; // Columns for background ranges (e.g., ["poor", "ok", "good"])
  };
  
  // Layout
  layout?: 'horizontal' | 'vertical';
  spacing?: number; // 0 to 40
  measureSize?: number; // 0 to 1
  markerSize?: number; // 0 to 1
  
  // Ranges (qualitative performance levels)
  rangeColors?: string[];
  
  // Measures (performance bars)
  measureColor?: string;
  measureBorderColor?: string;
  measureBorderWidth?: number; // 0 to 10
  
  // Markers (targets)
  markerColors?: string[];
  markerLineWidth?: number; // 1 to 10
  
  // Titles
  titleAlign?: 'start' | 'middle' | 'end';
  titleOffsetX?: number; // -100 to 100
  titleOffsetY?: number; // -100 to 100
  titleRotation?: number; // 0 to 360
}

// Data mapping example for documentation
export const DATA_MAPPING_EXAMPLE = {
  description: "Bullet charts show performance against targets with qualitative ranges. Perfect for KPI dashboards.",
  example: {
    csvColumns: ["KPI", "Actual", "Target", "Poor", "OK", "Good"],
    dataMapping: {
      idColumn: "KPI",
      actualColumn: "Actual", 
      targetColumn: "Target",
      rangeColumns: ["Poor", "OK", "Good"]
    },
    description: "Shows KPI performance with poor/ok/good ranges and target markers"
  }
}; 