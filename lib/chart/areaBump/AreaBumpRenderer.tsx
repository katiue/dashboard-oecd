import React from 'react';
import { ResponsiveAreaBump } from '@nivo/bump';
import type { AreaBumpChartConfig } from './AreaBumpSchema';

interface AreaBumpRendererProps {
  data: any[];
  config: AreaBumpChartConfig;
  theme?: any;
}

export const AreaBumpRenderer: React.FC<AreaBumpRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No data available for area bump chart
      </div>
    );
  }

  return (
    <ResponsiveAreaBump
      data={data}
      margin={config.margin || { top: 40, right: 100, bottom: 40, left: 100 }}
      align={config.align || 'middle'}
      interpolation={config.interpolation || 'smooth'}
      spacing={config.spacing || 8}
      xPadding={config.xPadding || 0.6}
      startLabel={config.startLabel !== false}
      startLabelPadding={config.startLabelPadding || 16}
      startLabelTextColor={config.startLabelTextColor || { from: 'color', modifiers: [['darker', 1]] }}
      endLabel={config.endLabel !== false}
      endLabelPadding={config.endLabelPadding || 16}
      endLabelTextColor={config.endLabelTextColor || { from: 'color', modifiers: [['darker', 1]] }}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      borderWidth={1}
      borderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
      borderOpacity={0.6}
      activeBorderWidth={3}
      inactiveBorderWidth={1}
      inactiveBorderOpacity={0.15}
      axisTop={config.axisTop}
      axisBottom={config.axisBottom || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: config.dataMapping.xColumn,
        legendPosition: 'middle',
        legendOffset: 32
      }}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 