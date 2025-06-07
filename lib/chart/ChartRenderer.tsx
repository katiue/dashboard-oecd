// filepath: d:/ai-chatbot/lib/chart/ChartRenderer.tsx
import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveRadar } from '@nivo/radar';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { ResponsiveAreaBump } from '@nivo/bump';
import type { ChartConfig } from '@/lib/chart/ChartSchemas';

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
  config?: ChartConfig; // Add configuration support
  theme?: any;
}

const customTheme: any = {
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
        strokeWidth: 12,
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

const ChartRenderer: React.FC<ChartRendererProps> = ({
  chartType,
  data,
  config,
  theme = customTheme,
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

  // Extract configuration with defaults
  const margin = config?.margin || { top: 50, right: 130, bottom: 50, left: 60 };
  const colors = config?.colors?.scheme || 'nivo';
  const animate = config?.animate !== false;

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
          
        const barConfig = config as Extract<ChartConfig, { chartType: 'bar' }> | undefined;
        
        return (
          <ResponsiveBar
            data={data}
            keys={keys}
            indexBy={indexBy}
            margin={margin}
            padding={barConfig?.padding || 0.3}
            valueScale={barConfig?.valueScale || { type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: colors }}
            theme={theme}
            animate={animate}
            enableLabel={barConfig?.enableLabel}
            labelSkipWidth={barConfig?.labelSkipWidth}
            labelSkipHeight={barConfig?.labelSkipHeight}
            enableGridX={barConfig?.enableGridX}
            enableGridY={barConfig?.enableGridY}
          />
        );
      }
      case 'line': {
        const lineConfig = config as Extract<ChartConfig, { chartType: 'line' }> | undefined;
        
        return (
          <ResponsiveLine
            data={data}
            margin={margin}
            xScale={lineConfig?.xScale as any || { type: 'point' }}
            yScale={lineConfig?.yScale as any || { type: 'linear', min: 'auto', max: 'auto' }}
            curve={lineConfig?.curve || 'linear'}
            lineWidth={lineConfig?.lineWidth}
            enablePoints={lineConfig?.enablePoints}
            pointSize={lineConfig?.pointSize}
            pointColor={lineConfig?.pointColor}
            pointBorderWidth={lineConfig?.pointBorderWidth}
            pointBorderColor={lineConfig?.pointBorderColor}
            enableArea={lineConfig?.enableArea}
            areaOpacity={lineConfig?.areaOpacity}
            enableGridX={lineConfig?.enableGridX}
            enableGridY={lineConfig?.enableGridY}
            enableCrosshair={lineConfig?.enableCrosshair}
            crosshairType={lineConfig?.crosshairType}
            legends={lineConfig?.legends as any} // Type cast to fix legend props type mismatch
            colors={{ scheme: colors }}
            theme={theme}
            animate={animate}
          />
        );
      }
      case 'pie': {
        const pieConfig = config as Extract<ChartConfig, { chartType: 'pie' }> | undefined;
        
        return (
          <ResponsivePie
            data={data}
            margin={margin}
            innerRadius={pieConfig?.innerRadius || 0.5}
            padAngle={pieConfig?.padAngle || 0.7}
            cornerRadius={pieConfig?.cornerRadius}
            sortByValue={pieConfig?.sortByValue}
            enableArcLabels={pieConfig?.enableArcLabels}
            arcLabel={pieConfig?.arcLabel}
            arcLabelsSkipAngle={pieConfig?.arcLabelsSkipAngle}
            enableArcLinkLabels={pieConfig?.enableArcLinkLabels}
            arcLinkLabel={pieConfig?.arcLinkLabel}
            legends={pieConfig?.legends as any} // Type cast to fix legend props type mismatch
            colors={{ scheme: colors }}
            theme={theme}
            animate={animate}
          />
        );
      }
      case 'heatmap': {
        // determine index key and value keys for heatmap
        const indexBy = Object.keys(data[0])[0];
        const keys = Object.keys(data[0]).filter((k) => k !== indexBy);
        const heatmapConfig = config as Extract<ChartConfig, { chartType: 'heatmap' }> | undefined;
        
        return (
          <ResponsiveHeatMap
            data={data}
            margin={margin}
            forceSquare={heatmapConfig?.forceSquare}
            sizeVariation={heatmapConfig?.sizeVariation as any} // Type cast to fix sizeVariation type mismatch
            enableLabels={heatmapConfig?.enableLabels}
            labelTextColor={heatmapConfig?.labelTextColor}
            colors={heatmapConfig?.colorScale?.colors as any} // Type cast to fix colorScale type mismatch
            theme={theme}
            animate={animate}
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
          
        const radarConfig = config as Extract<ChartConfig, { chartType: 'radar' }> | undefined;
        
        return (
          <ResponsiveRadar
            data={data}
            keys={keys}
            indexBy={indexBy}
            margin={margin}
            maxValue={radarConfig?.maxValue}
            curve={radarConfig?.curve}
            gridLevels={radarConfig?.gridLevels}
            gridShape={radarConfig?.gridShape}
            enableDots={radarConfig?.enableDots}
            dotSize={radarConfig?.dotSize}
            dotColor={radarConfig?.dotColor}
            dotBorderWidth={radarConfig?.dotBorderWidth}
            dotBorderColor={radarConfig?.dotBorderColor}
            fillOpacity={radarConfig?.fillOpacity}
            blendMode={radarConfig?.blendMode}
            legends={radarConfig?.legends as any} // Type cast to fix legend props type mismatch
            colors={{ scheme: colors }}
            theme={theme}
            animate={animate}
          />
        );
      }
      case 'scatter': {
        const scatterConfig = config as Extract<ChartConfig, { chartType: 'scatter' }> | undefined;
        
        // Try both direct config access and scatterConfig access for better compatibility
        const directXScale = (config as any)?.xScale;
        const directYScale = (config as any)?.yScale;
        
        // Build proper scale configurations for Nivo - support both approaches
        const xScale: any = (scatterConfig?.xScale || directXScale) ? {
          type: (scatterConfig?.xScale?.type || directXScale?.type) || 'linear',
          ...((scatterConfig?.xScale?.min !== undefined || directXScale?.min !== undefined) && { 
            min: scatterConfig?.xScale?.min ?? directXScale?.min 
          }),
          ...((scatterConfig?.xScale?.max !== undefined || directXScale?.max !== undefined) && { 
            max: scatterConfig?.xScale?.max ?? directXScale?.max 
          })
        } : { type: 'linear', min: 'auto', max: 'auto' };
        
        const yScale: any = (scatterConfig?.yScale || directYScale) ? {
          type: (scatterConfig?.yScale?.type || directYScale?.type) || 'linear',
          ...((scatterConfig?.yScale?.min !== undefined || directYScale?.min !== undefined) && { 
            min: scatterConfig?.yScale?.min ?? directYScale?.min 
          }),
          ...((scatterConfig?.yScale?.max !== undefined || directYScale?.max !== undefined) && { 
            max: scatterConfig?.yScale?.max ?? directYScale?.max 
          })
        } : { type: 'linear', min: 'auto', max: 'auto' };
        
        return (
          <ResponsiveScatterPlot
            data={data}
            margin={margin}
            nodeSize={typeof scatterConfig?.nodeSize === 'number' ? scatterConfig.nodeSize : 10}
            xScale={xScale}
            yScale={yScale}
            enableGridX={scatterConfig?.enableGridX}
            enableGridY={scatterConfig?.enableGridY}
            useMesh={scatterConfig?.useMesh}
            debugMesh={scatterConfig?.debugMesh}
            colors={{ scheme: colors }}
            theme={theme}
            animate={animate}
          />
        );
      }
      case 'areaBump': {
        const areaBumpConfig = config as Extract<ChartConfig, { chartType: 'areaBump' }> | undefined;
        
        return (
          <ResponsiveAreaBump
            data={data}
            margin={margin}
            align={areaBumpConfig?.align}
            interpolation={areaBumpConfig?.interpolation || 'smooth'}
            spacing={areaBumpConfig?.spacing || 8}
            xPadding={areaBumpConfig?.xPadding}
            startLabel={areaBumpConfig?.startLabel}
            endLabel={areaBumpConfig?.endLabel}
            colors={{ scheme: colors }}
            theme={theme}
            animate={animate}
          />
        );
      }
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
