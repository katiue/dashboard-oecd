// Waffle Chart Module
export type { WaffleChartConfig } from './WaffleSchema';
export { DATA_MAPPING_EXAMPLE } from './WaffleSchema';
export { processWaffleData, getRequiredColumns, validateCsvForWaffle } from './WaffleDataProcessor';
export { WaffleRenderer } from './WaffleRenderer'; 