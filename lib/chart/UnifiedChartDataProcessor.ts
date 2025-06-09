// Unified Chart Data Processor
// Centralizes all chart data processing functionality

import { processBarData, validateCsvForBar, getRequiredColumns as getBarRequiredColumns } from './bar/BarDataProcessor';
import { processLineData, validateCsvForLine, getRequiredColumns as getLineRequiredColumns } from './line/LineDataProcessor';
import { processPieData, validateCsvForPie, getRequiredColumns as getPieRequiredColumns } from './pie/PieDataProcessor';
import { processHeatmapData, validateCsvForHeatmap, getRequiredColumns as getHeatmapRequiredColumns } from './heatmap/HeatmapDataProcessor';
import { processRadarData, validateCsvForRadar, getRequiredColumns as getRadarRequiredColumns } from './radar/RadarDataProcessor';
import { processScatterData, validateCsvForScatter, getRequiredColumns as getScatterRequiredColumns } from './scatter/ScatterDataProcessor';
import { processAreaBumpData, validateCsvForAreaBump, getRequiredColumns as getAreaBumpRequiredColumns } from './areaBump/AreaBumpDataProcessor';
import { processCalendarData, validateCsvForCalendar } from './calendar/CalendarDataProcessor';
import { processChordData, validateCsvForChord, getRequiredColumns as getChordRequiredColumns } from './chord/ChordDataProcessor';
import { processCirclePackingData, validateCsvForCirclePacking, getRequiredColumns as getCirclePackingRequiredColumns } from './circlePacking/CirclePackingDataProcessor';
import { processSankeyData, validateCsvForSankey, getRequiredColumns as getSankeyRequiredColumns } from './sankey/SankeyDataProcessor';
import { processBoxPlotData, validateCsvForBoxPlot, getRequiredColumns as getBoxPlotRequiredColumns } from './boxplot/BoxPlotDataProcessor';
import { processBumpData, validateCsvForBump, getRequiredColumns as getBumpRequiredColumns } from './bump/BumpDataProcessor';
import { processBulletData, validateCsvForBullet, getRequiredColumns as getBulletRequiredColumns } from './bullet/BulletDataProcessor';
import { processFunnelData, validateCsvForFunnel, getRequiredColumns as getFunnelRequiredColumns } from './funnel/FunnelDataProcessor';
import { processStreamData, validateCsvForStream, getRequiredColumns as getStreamRequiredColumns } from './stream/StreamDataProcessor';
import { processSunburstData, validateCsvForSunburst, getRequiredColumns as getSunburstRequiredColumns } from './sunburst/SunburstDataProcessor';
import { processWaffleData, validateCsvForWaffle, getRequiredColumns as getWaffleRequiredColumns } from './waffle/WaffleDataProcessor';
import { processNetworkData, validateCsvForNetwork, getRequiredColumns as getNetworkRequiredColumns } from './network/NetworkDataProcessor';
import { processRadialBarData, validateCsvForRadialBar, getRequiredColumns as getRadialBarRequiredColumns } from './radialbar/RadialBarDataProcessor';
import { processSwarmplotData, validateCsvForSwarmplot, getRequiredColumns as getSwarmplotRequiredColumns } from './swarmplot/SwarmplotDataProcessor';
import { processTreemapData, validateCsvForTreemap, getRequiredColumns as getTreemapRequiredColumns } from './treemap/TreemapDataProcessor';
import { processVoronoiData, validateCsvForVoronoi, getRequiredColumns as getVoronoiRequiredColumns } from './voronoi/VoronoiDataProcessor';

// Import validation functions

// Import required columns functions
// Calendar doesn't need getRequiredColumns import as it's simple

import type { ChartType, ChartConfig } from './UnifiedChartRenderer';

export type { ChartType, ChartConfig };

// Process data for any chart type
export function processChartData(chartType: ChartType, csvData: string, config: ChartConfig): any[] {
  try {
    switch (chartType) {
      case 'bar':
        return processBarData(csvData, config as any);
      case 'line':
        return processLineData(csvData, config as any);
      case 'pie':
        return processPieData(csvData, config as any);
      case 'heatmap':
        return processHeatmapData(csvData, config as any);
      case 'radar':
        return processRadarData(csvData, config as any);
      case 'scatter':
        return processScatterData(csvData, config as any);
      case 'areaBump':
        return processAreaBumpData(csvData, config as any);
      case 'calendar':
        return processCalendarData(csvData, config as any);
      case 'chord':
        return processChordData(csvData, config as any);
      case 'circlePacking':
        return processCirclePackingData(csvData, config as any);
      case 'sankey':
        return processSankeyData(csvData, config as any);
      case 'boxplot':
        return processBoxPlotData(csvData, config as any);
      case 'bump':
        return processBumpData(csvData, config as any);
      case 'bullet':
        return processBulletData(csvData, config as any);
      case 'funnel':
        return processFunnelData(csvData, config as any);
      case 'stream':
        return processStreamData(csvData, config as any);
      case 'sunburst':
        return processSunburstData(csvData, config as any);
      case 'waffle':
        return processWaffleData(csvData, config as any);
      case 'network':
        return processNetworkData(csvData, config as any);
      case 'radialbar':
        return processRadialBarData(csvData, config as any);
      case 'swarmplot':
        return processSwarmplotData(csvData, config as any);
      case 'treemap':
        return processTreemapData(csvData, config as any);
      case 'voronoi':
        return processVoronoiData(csvData, config as any);
      default:
        throw new Error(`Unsupported chart type: ${chartType}`);
    }
  } catch (error) {
    console.error(`Error processing data for ${chartType} chart:`, error);
    return [];
  }
}

// Validate CSV for any chart type
export function validateCsvForChart(chartType: ChartType, csvData: string, config: ChartConfig): { valid: boolean; missingColumns: string[]; availableColumns: string[] } {
  try {
    switch (chartType) {
      case 'bar':
        return validateCsvForBar(csvData, config as any);
      case 'line':
        return validateCsvForLine(csvData, config as any);
      case 'pie':
        return validateCsvForPie(csvData, config as any);
      case 'heatmap':
        return validateCsvForHeatmap(csvData, config as any);
      case 'radar':
        return validateCsvForRadar(csvData, config as any);
      case 'scatter':
        return validateCsvForScatter(csvData, config as any);
      case 'areaBump':
        return validateCsvForAreaBump(csvData, config as any);
      case 'calendar':
        return validateCsvForCalendar(csvData, config as any);
      case 'chord':
        return validateCsvForChord(csvData, config as any);
      case 'circlePacking':
        return validateCsvForCirclePacking(csvData, config as any);
      case 'sankey':
        return validateCsvForSankey(csvData, config as any);
      case 'boxplot':
        return validateCsvForBoxPlot(csvData, config as any);
      case 'bump':
        return validateCsvForBump(csvData, config as any);
      case 'bullet':
        return validateCsvForBullet(csvData, config as any);
      case 'funnel':
        return validateCsvForFunnel(csvData, config as any);
      case 'stream':
        return validateCsvForStream(csvData, config as any);
      case 'sunburst':
        return validateCsvForSunburst(csvData, config as any);
      case 'waffle':
        return validateCsvForWaffle(csvData, config as any);
      case 'network':
        return validateCsvForNetwork(csvData, config as any);
      case 'radialbar':
        return validateCsvForRadialBar(csvData, config as any);
      case 'swarmplot':
        return validateCsvForSwarmplot(csvData, config as any);
      case 'treemap':
        return validateCsvForTreemap(csvData, config as any);
      case 'voronoi':
        return validateCsvForVoronoi(csvData, config as any);
      default:
        return {
          valid: false,
          missingColumns: [],
          availableColumns: []
        };
    }
  } catch (error) {
    console.error(`Error validating CSV for ${chartType} chart:`, error);
    return {
      valid: false,
      missingColumns: [],
      availableColumns: []
    };
  }
}

// Get required columns for any chart type
export function getRequiredColumnsForChart(chartType: ChartType, config: ChartConfig): string[] {
  try {
    switch (chartType) {
      case 'bar':
        return getBarRequiredColumns(config as any);
      case 'line':
        return getLineRequiredColumns(config as any);
      case 'pie':
        return getPieRequiredColumns(config as any);
      case 'heatmap':
        return getHeatmapRequiredColumns(config as any);
      case 'radar':
        return getRadarRequiredColumns(config as any);
      case 'scatter':
        return getScatterRequiredColumns(config as any);
      case 'areaBump':
        return getAreaBumpRequiredColumns(config as any);
      case 'calendar':
        return [(config as any).dataMapping.dateColumn, (config as any).dataMapping.valueColumn];
      case 'chord':
        return getChordRequiredColumns(config as any);
      case 'circlePacking':
        return getCirclePackingRequiredColumns(config as any);
      case 'sankey':
        return getSankeyRequiredColumns(config as any);
      case 'boxplot':
        return getBoxPlotRequiredColumns(config as any);
      case 'bump':
        return getBumpRequiredColumns(config as any);
      case 'bullet':
        return getBulletRequiredColumns(config as any);
      case 'funnel':
        return getFunnelRequiredColumns(config as any);
      case 'stream':
        return getStreamRequiredColumns(config as any);
      case 'sunburst':
        return getSunburstRequiredColumns(config as any);
      case 'waffle':
        return getWaffleRequiredColumns(config as any);
      case 'network':
        return getNetworkRequiredColumns(config as any);
      case 'radialbar':
        return getRadialBarRequiredColumns(config as any);
      case 'swarmplot':
        return getSwarmplotRequiredColumns(config as any);
      case 'treemap':
        return getTreemapRequiredColumns(config as any);
      case 'voronoi':
        return getVoronoiRequiredColumns(config as any);
      default:
        return [];
    }
  } catch (error) {
    console.error(`Error getting required columns for ${chartType} chart:`, error);
    return [];
  }
}

// Get available chart types
export function getAvailableChartTypes(): ChartType[] {
  return [
    'scatter', 'bar', 'line', 'pie', 'heatmap', 'radar', 'areaBump',
    'calendar', 'chord', 'circlePacking', 'sankey', 'boxplot',
    'bump', 'bullet', 'funnel', 'stream', 'sunburst', 'waffle',
    'network', 'radialbar', 'swarmplot', 'treemap', 'voronoi'
  ];
} 