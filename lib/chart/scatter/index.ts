// Scatter Chart Module
// Complete scatter plot implementation with schema, data processing, configuration, and rendering

export type { ScatterPlotConfig } from './ScatterSchema';
export { DATA_MAPPING_EXAMPLE } from './ScatterSchema';
export { processScatterData, getRequiredColumns, validateCsvForScatter } from './ScatterDataProcessor';
export { ScatterRenderer } from './ScatterRenderer';
export { ScatterConfig } from './ScatterConfig';

// Chart type constant
export const SCATTER_CHART_TYPE = 'scatter' as const; 