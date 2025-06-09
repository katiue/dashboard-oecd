import React from 'react';
import { ResponsiveBump } from '@nivo/bump';
import type { BumpChartConfig } from './BumpSchema';

interface BumpRendererProps {
  data: any[];
  config: BumpChartConfig;
  theme?: any;
}

export const BumpRenderer: React.FC<BumpRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No data available for bump chart
      </div>
    );
  }

  return (
    <ResponsiveBump
      data={data}
      margin={config.margin || { top: 40, right: 100, bottom: 40, left: 100 }}
      interpolation={config.interpolation || 'smooth'}
      xPadding={config.xPadding || 0.6}
      lineWidth={config.lineWidth || 3}
      pointSize={config.pointSize || 10}
      pointBorderWidth={config.pointBorderWidth || 1}
      pointBorderColor={config.pointBorderColor || { from: 'serie.color' }}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      startLabel={config.startLabel !== false}
      startLabelPadding={config.startLabelPadding || 16}
      startLabelTextColor={config.startLabelTextColor || { from: 'color', modifiers: [['darker', 1]] }}
      endLabel={config.endLabel !== false}
      endLabelPadding={config.endLabelPadding || 16}
      endLabelTextColor={config.endLabelTextColor || { from: 'color', modifiers: [['darker', 1]] }}
      axisTop={config.axisTop}
      axisBottom={config.axisBottom || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: config.dataMapping.xColumn,
        legendPosition: 'middle',
        legendOffset: 32
      }}
      axisLeft={config.axisLeft || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Ranking',
        legendPosition: 'middle',
        legendOffset: -40
      }}
      axisRight={config.axisRight}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 