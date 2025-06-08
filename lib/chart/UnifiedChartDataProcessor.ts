// Unified Chart Data Processor
// Centralizes all chart data processing functionality

import { processBarData } from './bar/BarDataProcessor';
import { processLineData } from './line/LineDataProcessor';
import { processPieData } from './pie/PieDataProcessor';
import { processHeatmapData } from './heatmap/HeatmapDataProcessor';
import { processRadarData } from './radar/RadarDataProcessor';
import { processScatterData } from './scatter/ScatterDataProcessor';
import { processAreaBumpData } from './areaBump/AreaBumpDataProcessor';
import { processCalendarData } from './calendar/CalendarDataProcessor';
import { processChordData } from './chord/ChordDataProcessor';
import { processCirclePackingData } from './circlePacking/CirclePackingDataProcessor';
import { processSankeyData } from './sankey/SankeyDataProcessor';
import { processBoxPlotData } from './boxplot/BoxPlotDataProcessor';
import { processBumpData } from './bump/BumpDataProcessor';
import { processBulletData } from './bullet/BulletDataProcessor';
import { processFunnelData } from './funnel/FunnelDataProcessor';
import { processStreamData } from './stream/StreamDataProcessor';
import { processSunburstData } from './sunburst/SunburstDataProcessor';
import { processWaffleData } from './waffle/WaffleDataProcessor';
import { processNetworkData } from './network/NetworkDataProcessor';
import { processRadialBarData } from './radialbar/RadialBarDataProcessor';
import { processSwarmplotData } from './swarmplot/SwarmplotDataProcessor';
import { processTreemapData } from './treemap/TreemapDataProcessor';
import { processVoronoiData } from './voronoi/VoronoiDataProcessor';

// Import validation functions
import { validateCsvForBar } from './bar/BarDataProcessor';
import { validateCsvForLine } from './line/LineDataProcessor';
import { validateCsvForPie } from './pie/PieDataProcessor';
import { validateCsvForHeatmap } from './heatmap/HeatmapDataProcessor';
import { validateCsvForRadar } from './radar/RadarDataProcessor';
import { validateCsvForScatter } from './scatter/ScatterDataProcessor';
import { validateCsvForAreaBump } from './areaBump/AreaBumpDataProcessor';
import { validateCsvForCalendar } from './calendar/CalendarDataProcessor';
import { validateCsvForChord } from './chord/ChordDataProcessor';
import { validateCsvForCirclePacking } from './circlePacking/CirclePackingDataProcessor';
import { validateCsvForSankey } from './sankey/SankeyDataProcessor';
import { validateCsvForBoxPlot } from './boxplot/BoxPlotDataProcessor';
import { validateCsvForBump } from './bump/BumpDataProcessor';
import { validateCsvForBullet } from './bullet/BulletDataProcessor';
import { validateCsvForFunnel } from './funnel/FunnelDataProcessor';
import { validateCsvForStream } from './stream/StreamDataProcessor';
import { validateCsvForSunburst } from './sunburst/SunburstDataProcessor';
import { validateCsvForWaffle } from './waffle/WaffleDataProcessor';
import { validateCsvForNetwork } from './network/NetworkDataProcessor';
import { validateCsvForRadialBar } from './radialbar/RadialBarDataProcessor';
import { validateCsvForSwarmplot } from './swarmplot/SwarmplotDataProcessor';
import { validateCsvForTreemap } from './treemap/TreemapDataProcessor';
import { validateCsvForVoronoi } from './voronoi/VoronoiDataProcessor';

// Import required columns functions
import { getRequiredColumns as getBarRequiredColumns } from './bar/BarDataProcessor';
import { getRequiredColumns as getLineRequiredColumns } from './line/LineDataProcessor';
import { getRequiredColumns as getPieRequiredColumns } from './pie/PieDataProcessor';
import { getRequiredColumns as getHeatmapRequiredColumns } from './heatmap/HeatmapDataProcessor';
import { getRequiredColumns as getRadarRequiredColumns } from './radar/RadarDataProcessor';
import { getRequiredColumns as getScatterRequiredColumns } from './scatter/ScatterDataProcessor';
import { getRequiredColumns as getAreaBumpRequiredColumns } from './areaBump/AreaBumpDataProcessor';
// Calendar doesn't need getRequiredColumns import as it's simple
import { getRequiredColumns as getChordRequiredColumns } from './chord/ChordDataProcessor';
import { getRequiredColumns as getCirclePackingRequiredColumns } from './circlePacking/CirclePackingDataProcessor';
import { getRequiredColumns as getSankeyRequiredColumns } from './sankey/SankeyDataProcessor';
import { getRequiredColumns as getBoxPlotRequiredColumns } from './boxplot/BoxPlotDataProcessor';
import { getRequiredColumns as getBumpRequiredColumns } from './bump/BumpDataProcessor';
import { getRequiredColumns as getBulletRequiredColumns } from './bullet/BulletDataProcessor';
import { getRequiredColumns as getFunnelRequiredColumns } from './funnel/FunnelDataProcessor';
import { getRequiredColumns as getStreamRequiredColumns } from './stream/StreamDataProcessor';
import { getRequiredColumns as getSunburstRequiredColumns } from './sunburst/SunburstDataProcessor';
import { getRequiredColumns as getWaffleRequiredColumns } from './waffle/WaffleDataProcessor';
import { getRequiredColumns as getNetworkRequiredColumns } from './network/NetworkDataProcessor';
import { getRequiredColumns as getRadialBarRequiredColumns } from './radialbar/RadialBarDataProcessor';
import { getRequiredColumns as getSwarmplotRequiredColumns } from './swarmplot/SwarmplotDataProcessor';
import { getRequiredColumns as getTreemapRequiredColumns } from './treemap/TreemapDataProcessor';
import { getRequiredColumns as getVoronoiRequiredColumns } from './voronoi/VoronoiDataProcessor';

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