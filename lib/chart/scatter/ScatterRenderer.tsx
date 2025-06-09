// Scatter Plot Renderer
import React from 'react';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import type { ScatterPlotConfig } from './ScatterSchema';

interface ScatterRendererProps {
  data: any[];
  config: ScatterPlotConfig;
  theme?: any;
}

export const ScatterRenderer: React.FC<ScatterRendererProps> = ({
  data,
  config,
  theme
}) => {
  // Validate scatter data
  const validScatterData = data.filter(series => 
    series && 
    Array.isArray(series.data) && 
    series.data.length > 0 &&
    series.data.every((point: any) => 
      point && 
      typeof point.x === 'number' && 
      Number.
      isFinite(point.x) &&
      typeof point.y === 'number' && 
      Number.
      isFinite(point.y)
    )
  );
  
  if (validScatterData.length === 0) {
    return (
      <div className="flex size-full items-center justify-center">
        <p className="text-muted-foreground">Scatter plot requires valid x,y coordinate data</p>
      </div>
    );
  }
  
  // Extract configuration with defaults
  const margin = config.margin || { top: 50, right: 130, bottom: 50, left: 60 };
  const colors = config.colors?.scheme || 'nivo';
  const animate = config.animate !== false;
  
  const directXScale = (config as any)?.xScale;
  const directYScale = (config as any)?.yScale;
  
  const xScale: any = (config.xScale || directXScale) ? {
    type: (config.xScale?.type || directXScale?.type) || 'linear',
    ...((config.xScale?.min !== undefined || directXScale?.min !== undefined) && { 
      min: config.xScale?.min ?? directXScale?.min 
    }),
    ...((config.xScale?.max !== undefined || directXScale?.max !== undefined) && { 
      max: config.xScale?.max ?? directXScale?.max 
    })
  } : { type: 'linear', min: 'auto', max: 'auto' };
  
  const yScale: any = (config.yScale || directYScale) ? {
    type: (config.yScale?.type || directYScale?.type) || 'linear',
    ...((config.yScale?.min !== undefined || directYScale?.min !== undefined) && { 
      min: config.yScale?.min ?? directYScale?.min 
    }),
    ...((config.yScale?.max !== undefined || directYScale?.max !== undefined) && { 
      max: config.yScale?.max ?? directYScale?.max 
    })
  } : { type: 'linear', min: 'auto', max: 'auto' };
  
  return (
    <ResponsiveScatterPlot
      data={validScatterData}
      margin={margin}
      nodeSize={typeof config.nodeSize === 'number' ? config.nodeSize : 10}
      xScale={xScale}
      yScale={yScale}
      enableGridX={config.enableGridX}
      enableGridY={config.enableGridY}
      useMesh={config.useMesh}
      debugMesh={config.debugMesh}
      axisTop={config.axisTop as any}
      axisRight={config.axisRight as any}
      axisBottom={config.axisBottom as any}
      axisLeft={config.axisLeft as any}
      legends={config.legends as any}
      colors={{ scheme: colors }}
      theme={theme}
      animate={animate}
    />
  );
}; 