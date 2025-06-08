// Chart Library Main Index
// Exports the unified, modular chart system

// Main components
export { UnifiedChartRenderer } from './UnifiedChartRenderer';
export { UnifiedChartConfig } from './UnifiedChartConfig';

// Unified data processing and validation
export { 
  processChartData, 
  getRequiredColumnsForChart, 
  validateCsvForChart, 
  getAvailableChartTypes 
} from './UnifiedChartDataProcessor';

export type { ChartType, ChartConfig } from './UnifiedChartRenderer';

// Base schemas
export type { BaseChartConfig, AxisConfig, LegendConfig } from './shared/BaseSchemas';

// Individual chart modules (for direct access if needed)
export type { ScatterPlotConfig } from './scatter/ScatterSchema';
export { ScatterRenderer } from './scatter/ScatterRenderer';
export { ScatterConfig } from './scatter/ScatterConfig';
export { processScatterData, getRequiredColumns as getScatterRequiredColumns, validateCsvForScatter } from './scatter/ScatterDataProcessor';
export { DATA_MAPPING_EXAMPLE as ScatterDataMappingExample } from './scatter/ScatterSchema';

export type { BarChartConfig } from './bar/BarSchema';
export { BarRenderer } from './bar/BarRenderer';
export { BarConfig } from './bar/BarConfig';
export { processBarData, getRequiredColumns as getBarRequiredColumns, validateCsvForBar } from './bar/BarDataProcessor';
export { DATA_MAPPING_EXAMPLE as BarDataMappingExample } from './bar/BarSchema';

export type { LineChartConfig } from './line/LineSchema';
export { LineRenderer } from './line/LineRenderer';
export { LineConfig } from './line/LineConfig';
export { processLineData, getRequiredColumns as getLineRequiredColumns, validateCsvForLine } from './line/LineDataProcessor';
export { DATA_MAPPING_EXAMPLE as LineDataMappingExample } from './line/LineSchema';

export type { PieChartConfig } from './pie/PieSchema';
export { PieRenderer } from './pie/PieRenderer';
export { PieConfig } from './pie/PieConfig';
export { processPieData, getRequiredColumns as getPieRequiredColumns, validateCsvForPie } from './pie/PieDataProcessor';
export { DATA_MAPPING_EXAMPLE as PieDataMappingExample } from './pie/PieSchema';

export type { HeatmapChartConfig } from './heatmap/HeatmapSchema';
export { HeatmapRenderer } from './heatmap/HeatmapRenderer';
export { HeatmapConfig } from './heatmap/HeatmapConfig';
export { processHeatmapData, getRequiredColumns as getHeatmapRequiredColumns, validateCsvForHeatmap } from './heatmap/HeatmapDataProcessor';
export { DATA_MAPPING_EXAMPLE as HeatmapDataMappingExample } from './heatmap/HeatmapSchema';

export type { RadarChartConfig } from './radar/RadarSchema';
export { RadarRenderer } from './radar/RadarRenderer';
export { RadarConfig } from './radar/RadarConfig';
export { processRadarData, getRequiredColumns as getRadarRequiredColumns, validateCsvForRadar } from './radar/RadarDataProcessor';
export { DATA_MAPPING_EXAMPLE as RadarDataMappingExample } from './radar/RadarSchema';

export type { AreaBumpChartConfig } from './areaBump/AreaBumpSchema';
export { AreaBumpRenderer } from './areaBump/AreaBumpRenderer';
export { processAreaBumpData, getRequiredColumns as getAreaBumpRequiredColumns, validateCsvForAreaBump } from './areaBump/AreaBumpDataProcessor';
export { DATA_MAPPING_EXAMPLE as AreaBumpDataMappingExample } from './areaBump/AreaBumpSchema';

// Additional chart types
export type { CalendarChartConfig } from './calendar/CalendarSchema';
export { CalendarRenderer } from './calendar/CalendarRenderer';
export { CalendarConfig } from './calendar/CalendarConfig';

export type { ChordChartConfig } from './chord/ChordSchema';
export { ChordRenderer } from './chord/ChordRenderer';

export type { CirclePackingChartConfig } from './circlePacking/CirclePackingSchema';
export { CirclePackingRenderer } from './circlePacking/CirclePackingRenderer';

export type { SankeyChartConfig } from './sankey/SankeySchema';
export { SankeyRenderer } from './sankey/SankeyRenderer';

export type { BoxPlotChartConfig } from './boxplot/BoxPlotSchema';
export { BoxPlotRenderer } from './boxplot/BoxPlotRenderer';

export type { BumpChartConfig } from './bump/BumpSchema';
export { BumpRenderer } from './bump/BumpRenderer';

export type { BulletChartConfig } from './bullet/BulletSchema';
export { BulletRenderer } from './bullet/BulletRenderer';

export type { FunnelChartConfig } from './funnel/FunnelSchema';
export { FunnelRenderer } from './funnel/FunnelRenderer';

export type { StreamChartConfig } from './stream/StreamSchema';
export { StreamRenderer } from './stream/StreamRenderer';

export type { SunburstChartConfig } from './sunburst/SunburstSchema';
export { SunburstRenderer } from './sunburst/SunburstRenderer';

export type { WaffleChartConfig } from './waffle/WaffleSchema';
export { WaffleRenderer } from './waffle/WaffleRenderer';

export type { NetworkChartConfig } from './network/NetworkSchema';
export { NetworkRenderer } from './network/NetworkRenderer';

export type { RadialBarChartConfig } from './radialbar/RadialBarSchema';
export { RadialBarRenderer } from './radialbar/RadialBarRenderer';

export type { SwarmplotChartConfig } from './swarmplot/SwarmplotSchema';
export { SwarmplotRenderer } from './swarmplot/SwarmplotRenderer';

export type { TreemapChartConfig } from './treemap/TreemapSchema';
export { TreemapRenderer } from './treemap/TreemapRenderer';

export type { VoronoiChartConfig } from './voronoi/VoronoiSchema';
export { VoronoiRenderer } from './voronoi/VoronoiRenderer';

// Utility functions for backwards compatibility
export function getSupportedChartTypes() {
  return [
    'scatter', 'bar', 'line', 'pie', 'heatmap', 'radar', 'areaBump',
    'calendar', 'chord', 'circlePacking', 'sankey', 'boxplot',
    'bump', 'bullet', 'funnel', 'stream', 'sunburst', 'waffle',
    'network', 'radialbar', 'swarmplot', 'treemap', 'voronoi'
  ] as const;
}

/**
 * Check if a chart type is supported by the unified system
 */
export function isChartTypeSupported(chartType: string) {
  return getSupportedChartTypes().includes(chartType as any);
}

// Main unified renderer as default export
export { UnifiedChartRenderer as default } from './UnifiedChartRenderer';