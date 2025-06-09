import React from 'react';
import { ResponsiveRadialBar } from '@nivo/radial-bar';
import type { RadialBarChartConfig } from './RadialBarSchema';

interface RadialBarRendererProps {
  data: any[];
  config: RadialBarChartConfig;
  theme?: any;
}

export const RadialBarRenderer: React.FC<RadialBarRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No data available for radial bar chart
      </div>
    );
  }

  return (
    <ResponsiveRadialBar
      data={data}
      valueFormat=">-.2f"
      margin={config.margin || { top: 40, right: 120, bottom: 40, left: 40 }}
      maxValue={config.maxValue === 'auto' ? 'auto' : config.maxValue}
      startAngle={config.startAngle || 0}
      endAngle={config.endAngle || 270}
      innerRadius={config.innerRadius || 0.1}
      padding={config.padding || 0.4}
      padAngle={config.padAngle || 0}
      cornerRadius={config.cornerRadius || 0}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      enableTracks={config.enableTracks !== false}
      tracksColor={config.tracksColor || '#cccccc'}
      enableRadialGrid={config.enableRadialGrid !== false}
      enableCircularGrid={config.enableCircularGrid !== false}
      radialAxisStart={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
      circularAxisOuter={{ tickSize: 5, tickPadding: 12, tickRotation: 0 }}
      enableLabels={config.enableLabels !== false}
      label={config.label || 'id'}
      labelsSkipAngle={config.labelsSkipAngle || 10}
      labelsRadiusOffset={config.labelsRadiusOffset || 0.4}
      labelsTextColor={config.labelsTextColor || '#333333'}
      legends={config.legends as any}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 