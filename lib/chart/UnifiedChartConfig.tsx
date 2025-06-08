// Unified Chart Configuration Component
// Dynamically renders the appropriate configuration UI based on chart type

import React from 'react';
import { BarConfig } from './bar/BarConfig';
import { LineConfig } from './line/LineConfig';
import { PieConfig } from './pie/PieConfig';
import { HeatmapConfig } from './heatmap/HeatmapConfig';
import { RadarConfig } from './radar/RadarConfig';
import { ScatterConfig } from './scatter/ScatterConfig';
import { CalendarConfig } from './calendar/CalendarConfig';

// Import chart config types
import type { ChartType, ChartConfig } from './UnifiedChartRenderer';
import type { BarChartConfig } from './bar/BarSchema';
import type { LineChartConfig } from './line/LineSchema';
import type { PieChartConfig } from './pie/PieSchema';
import type { HeatmapChartConfig } from './heatmap/HeatmapSchema';
import type { RadarChartConfig } from './radar/RadarSchema';
import type { ScatterPlotConfig } from './scatter/ScatterSchema';
import type { CalendarChartConfig } from './calendar/CalendarSchema';

export interface UnifiedChartConfigProps {
  chartType: ChartType;
  config: ChartConfig;
  onChange: (updates: Partial<ChartConfig>) => void;
}

export const UnifiedChartConfig: React.FC<UnifiedChartConfigProps> = ({
  chartType,
  config,
  onChange,
}) => {
  // Render the appropriate config component based on chart type
  try {
    switch (chartType) {
      case 'bar':
        return <BarConfig config={config as BarChartConfig} onChange={onChange as any} />;
      case 'line':
        return <LineConfig config={config as LineChartConfig} onChange={onChange as any} />;
      case 'pie':
        return <PieConfig config={config as PieChartConfig} onChange={onChange as any} />;
      case 'heatmap':
        return <HeatmapConfig config={config as HeatmapChartConfig} onChange={onChange as any} />;
      case 'radar':
        return <RadarConfig config={config as RadarChartConfig} onChange={onChange as any} />;
      case 'scatter':
        return <ScatterConfig config={config as ScatterPlotConfig} onChange={onChange as any} />;
      case 'calendar':
        return <CalendarConfig config={config as CalendarChartConfig} onChange={onChange as any} />;
      
      // For chart types without specific config components, show a basic message
      case 'areaBump':
      case 'chord':
      case 'circlePacking':
      case 'sankey':
      case 'boxplot':
      case 'bump':
      case 'bullet':
      case 'funnel':
      case 'stream':
      case 'sunburst':
      case 'waffle':
      case 'network':
      case 'radialbar':
      case 'swarmplot':
      case 'treemap':
      case 'voronoi':
        return (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Configuration panel for {chartType} charts is not yet implemented.
              The chart will use default settings.
            </p>
          </div>
        );
      
      default:
        return (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Unknown chart type: {chartType}
            </p>
          </div>
        );
    }
  } catch (error) {
    console.error("Error rendering chart configuration:", error);
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          Error loading configuration for {chartType} chart
        </p>
      </div>
    );
  }
}; 