import React from 'react';
import { ResponsiveStream } from '@nivo/stream';
import type { StreamChartConfig } from './StreamSchema';

interface StreamRendererProps {
  data: any[];
  config: StreamChartConfig;
  theme?: any;
}

export const StreamRenderer: React.FC<StreamRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No data available for stream chart
      </div>
    );
  }

  // Extract keys from data for stream chart
  const keys = config.dataMapping.valueColumns.filter(col => 
    data.some(item => item[col] !== undefined && Number.isFinite(item[col]))
  );

  if (keys.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No valid value columns found for stream chart
      </div>
    );
  }

  return (
    <ResponsiveStream
      data={data}
      keys={keys}
      margin={config.margin || { top: 50, right: 110, bottom: 50, left: 60 }}
      axisTop={config.axisTop}
      axisRight={config.axisRight}
      axisBottom={config.axisBottom || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: config.dataMapping.xColumn,
        legendOffset: 36
      }}
      axisLeft={config.axisLeft || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Value',
        legendOffset: -40
      }}
      offsetType={config.offsetType || 'wiggle'}
      order={config.order || 'none'}
      curve={config.curve || 'catmullRom'}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      fillOpacity={config.fillOpacity || 0.85}
      borderWidth={config.borderWidth || 0}
      borderColor={config.borderColor || { theme: 'background' }}
      enableDots={config.enableDots || false}
      dotSize={config.dotSize || 8}
      dotColor={config.dotColor || { from: 'color' }}
      dotBorderWidth={config.dotBorderWidth || 2}
      dotBorderColor={config.dotBorderColor || { from: 'color', modifiers: [['darker', 0.7]] }}
      enableStackTooltip={config.enableStackTooltip !== false}
      legends={config.legends as any}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 