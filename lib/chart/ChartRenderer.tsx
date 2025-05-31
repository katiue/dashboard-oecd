// filepath: d:/ai-chatbot/lib/chart/ChartRenderer.tsx
import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveRadar } from '@nivo/radar';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { ResponsiveAreaBump } from '@nivo/bump';

export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'heatmap'
  | 'radar'
  | 'scatter'
  | 'areaBump';

interface ChartRendererProps {
  chartType: ChartType;
  data: any[];
  theme?: any;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({
  chartType,
  data,
  theme,
}) => {
  // Enhanced data validation
  if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) {
    return <div className="flex h-full w-full items-center justify-center">
      <p className="text-muted-foreground">No data available for this chart</p>
    </div>;
  }

  // Safety check for empty objects
  const firstItem = data[0];
  if (!firstItem || Object.keys(firstItem).length === 0) {
    return <div className="flex h-full w-full items-center justify-center">
      <p className="text-muted-foreground">Chart data is missing required properties</p>
    </div>;
  }

  try {
    switch (chartType) {
      case 'bar': {
        const keys = Object.keys(firstItem).filter(
          (k) => typeof firstItem[k] === 'number',
        );
        // If no numeric properties found, provide feedback
        if (keys.length === 0) {
          return <div className="flex h-full w-full items-center justify-center">
            <p className="text-muted-foreground">Bar chart requires numeric data values</p>
          </div>;
        }

        const indexBy =
          Object.keys(firstItem).find((k) => typeof firstItem[k] === 'string') ||
          'id';
        return (
          <ResponsiveBar
            data={data}
            keys={keys}
            indexBy={indexBy}
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'nivo' }}
            theme={theme}
          />
        );
      }
      case 'line':
        return (
          <ResponsiveLine
            data={data}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            theme={theme}
          />
        );
      case 'pie':
        return (
          <ResponsivePie
            data={data}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            theme={theme}
          />
        );
      case 'heatmap': {
        // determine index key and value keys for heatmap
        const indexBy = Object.keys(data[0])[0];
        const keys = Object.keys(data[0]).filter((k) => k !== indexBy);
        return (
          <ResponsiveHeatMap
            data={data}
            margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
            theme={theme}
          />
        );
      }
      case 'radar': {
        const keys = Object.keys(data[0]).filter(
          (k) => typeof data[0][k] === 'number',
        );
        const indexBy =
          Object.keys(data[0]).find((k) => typeof data[0][k] === 'string') ||
          'id';
        return (
          <ResponsiveRadar
            data={data}
            keys={keys}
            indexBy={indexBy}
            margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
            theme={theme}
          />
        );
      }
      case 'scatter':
        return (
          <ResponsiveScatterPlot
            data={data}
            margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
            theme={theme}
          />
        );
      case 'areaBump':
        return (
          <ResponsiveAreaBump
            data={data}
            margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
            spacing={8}
            colors={{ scheme: 'nivo' }}
            theme={theme}
          />
        );
      default:
        return <div>Unsupported chart type: {chartType}</div>;
    }
  } catch (error) {
    console.error("Error rendering chart:", error);
    return <div className="flex h-full w-full items-center justify-center">
      <p className="text-muted-foreground">Error rendering chart</p>
    </div>;
  }
};

export default ChartRenderer;
