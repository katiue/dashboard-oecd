// Unified Chart Renderer
// Uses the chart registry to render any chart type dynamically

import React from 'react';
import { BarRenderer } from './bar/BarRenderer';
import { LineRenderer } from './line/LineRenderer';
import { PieRenderer } from './pie/PieRenderer';
import { HeatmapRenderer } from './heatmap/HeatmapRenderer';
import { RadarRenderer } from './radar/RadarRenderer';
import { ScatterRenderer } from './scatter/ScatterRenderer';
import { AreaBumpRenderer } from './areaBump/AreaBumpRenderer';
import { CalendarRenderer } from './calendar/CalendarRenderer';
import { ChordRenderer } from './chord/ChordRenderer';
import { CirclePackingRenderer } from './circlePacking/CirclePackingRenderer';
import { SankeyRenderer } from './sankey/SankeyRenderer';
import { BoxPlotRenderer } from './boxplot/BoxPlotRenderer';
import { BumpRenderer } from './bump/BumpRenderer';
import { BulletRenderer } from './bullet/BulletRenderer';
import { FunnelRenderer } from './funnel/FunnelRenderer';
import { StreamRenderer } from './stream/StreamRenderer';
import { SunburstRenderer } from './sunburst/SunburstRenderer';
import { WaffleRenderer } from './waffle/WaffleRenderer';
import { NetworkRenderer } from './network/NetworkRenderer';
import { RadialBarRenderer } from './radialbar/RadialBarRenderer';
import { SwarmplotRenderer } from './swarmplot/SwarmplotRenderer';
import { TreemapRenderer } from './treemap/TreemapRenderer';
import { VoronoiRenderer } from './voronoi/VoronoiRenderer';

// Import chart config types
import type { BarChartConfig } from './bar/BarSchema';
import type { LineChartConfig } from './line/LineSchema';
import type { PieChartConfig } from './pie/PieSchema';
import type { HeatmapChartConfig } from './heatmap/HeatmapSchema';
import type { RadarChartConfig } from './radar/RadarSchema';
import type { ScatterPlotConfig } from './scatter/ScatterSchema';
import type { AreaBumpChartConfig } from './areaBump/AreaBumpSchema';
import type { CalendarChartConfig } from './calendar/CalendarSchema';
import type { ChordChartConfig } from './chord/ChordSchema';
import type { CirclePackingChartConfig } from './circlePacking/CirclePackingSchema';
import type { SankeyChartConfig } from './sankey/SankeySchema';
import type { BoxPlotChartConfig } from './boxplot/BoxPlotSchema';
import type { BumpChartConfig } from './bump/BumpSchema';
import type { BulletChartConfig } from './bullet/BulletSchema';
import type { FunnelChartConfig } from './funnel/FunnelSchema';
import type { StreamChartConfig } from './stream/StreamSchema';
import type { SunburstChartConfig } from './sunburst/SunburstSchema';
import type { WaffleChartConfig } from './waffle/WaffleSchema';
import type { NetworkChartConfig } from './network/NetworkSchema';
import type { RadialBarChartConfig } from './radialbar/RadialBarSchema';
import type { SwarmplotChartConfig } from './swarmplot/SwarmplotSchema';
import type { TreemapChartConfig } from './treemap/TreemapSchema';
import type { VoronoiChartConfig } from './voronoi/VoronoiSchema';

export type ChartType = 
  | 'scatter' | 'bar' | 'line' | 'pie' | 'heatmap' | 'radar' | 'areaBump'
  | 'calendar' | 'chord' | 'circlePacking' | 'sankey' | 'boxplot'
  | 'bump' | 'bullet' | 'funnel' | 'stream' | 'sunburst' | 'waffle'
  | 'network' | 'radialbar' | 'swarmplot' | 'treemap' | 'voronoi';

export type ChartConfig = 
  | BarChartConfig | LineChartConfig | PieChartConfig | HeatmapChartConfig | RadarChartConfig | ScatterPlotConfig | AreaBumpChartConfig
  | CalendarChartConfig | ChordChartConfig | CirclePackingChartConfig | SankeyChartConfig | BoxPlotChartConfig
  | BumpChartConfig | BulletChartConfig | FunnelChartConfig | StreamChartConfig | SunburstChartConfig | WaffleChartConfig
  | NetworkChartConfig | RadialBarChartConfig | SwarmplotChartConfig | TreemapChartConfig | VoronoiChartConfig;

const defaultTheme = {
  axis: {
    domain: {
      line: {
        stroke: '#ffffff',
        strokeWidth: 1,
      },
    },
    ticks: {
      line: {
        stroke: '#ffffff', 
        strokeWidth: 1,
      },
      text: {
        fill: '#ffffff',
        fontSize: 12,
      },
    },
    legend: {
      text: {
        fill: '#ffffff',
        fontSize: 14,
      },
    },
  },
  grid: {
    line: {
      stroke: '#ffffff',
      strokeWidth: 1,
      strokeOpacity: 0.2,
    },
  },
  text: {
    fill: '#ffffff',
  },
  tooltip: {
    container: {
      background: '#333333',
      color: '#ffffff',
    },
  },
};

export interface UnifiedChartRendererProps {
  chartType: ChartType;
  data: any[];
  config: ChartConfig;
  theme?: any;
}

export const UnifiedChartRenderer: React.FC<UnifiedChartRendererProps> = ({
  chartType,
  data,
  config,
  theme = defaultTheme,
}) => {
  // Data validation
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No data available for this chart</p>
      </div>
    );
  }

  // Render the appropriate chart based on type
  try {
    switch (chartType) {
      case 'bar':
        return <BarRenderer data={data} config={config as BarChartConfig} theme={theme} />;
      case 'line':
        return <LineRenderer data={data} config={config as LineChartConfig} theme={theme} />;
      case 'pie':
        return <PieRenderer data={data} config={config as PieChartConfig} theme={theme} />;
      case 'heatmap':
        return <HeatmapRenderer data={data} config={config as HeatmapChartConfig} theme={theme} />;
      case 'radar':
        return <RadarRenderer data={data} config={config as RadarChartConfig} theme={theme} />;
      case 'scatter':
        return <ScatterRenderer data={data} config={config as ScatterPlotConfig} theme={theme} />;
      case 'areaBump':
        return <AreaBumpRenderer data={data} config={config as AreaBumpChartConfig} theme={theme} />;
      case 'calendar':
        return <CalendarRenderer data={data} config={config as CalendarChartConfig} theme={theme} />;
      case 'chord':
        return <ChordRenderer data={data} config={config as ChordChartConfig} theme={theme} />;
      case 'circlePacking':
        return <CirclePackingRenderer data={data} config={config as CirclePackingChartConfig} theme={theme} />;
      case 'sankey':
        return <SankeyRenderer data={data} config={config as SankeyChartConfig} theme={theme} />;
      case 'boxplot':
        return <BoxPlotRenderer data={data} config={config as BoxPlotChartConfig} theme={theme} />;
      case 'bump':
        return <BumpRenderer data={data} config={config as BumpChartConfig} theme={theme} />;
      case 'bullet':
        return <BulletRenderer data={data} config={config as BulletChartConfig} theme={theme} />;
      case 'funnel':
        return <FunnelRenderer data={data} config={config as FunnelChartConfig} theme={theme} />;
      case 'stream':
        return <StreamRenderer data={data} config={config as StreamChartConfig} theme={theme} />;
      case 'sunburst':
        return <SunburstRenderer data={data} config={config as SunburstChartConfig} theme={theme} />;
      case 'waffle':
        return <WaffleRenderer data={data} config={config as WaffleChartConfig} theme={theme} />;
      case 'network':
        return <NetworkRenderer data={data} config={config as NetworkChartConfig} theme={theme} />;
      case 'radialbar':
        return <RadialBarRenderer data={data} config={config as RadialBarChartConfig} theme={theme} />;
      case 'swarmplot':
        return <SwarmplotRenderer data={data} config={config as SwarmplotChartConfig} theme={theme} />;
      case 'treemap':
        return <TreemapRenderer data={data} config={config as TreemapChartConfig} theme={theme} />;
      case 'voronoi':
        return <VoronoiRenderer data={data} config={config as VoronoiChartConfig} theme={theme} />;
      default:
        return (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-muted-foreground">
              Unsupported chart type: {chartType}
            </p>
          </div>
        );
    }
  } catch (error) {
    console.error("Error rendering chart:", error);
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">
          Error rendering {chartType} chart
        </p>
      </div>
    );
  }
};

// Legacy compatibility export (to replace the old ChartRenderer)
export default UnifiedChartRenderer; 