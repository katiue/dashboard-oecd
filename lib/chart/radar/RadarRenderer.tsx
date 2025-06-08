import React from 'react';
import { ResponsiveRadar } from '@nivo/radar';
import type { RadarChartConfig } from './RadarSchema';

interface RadarRendererProps {
  data: any[];
  config: RadarChartConfig;
  theme?: any;
}

export const RadarRenderer: React.FC<RadarRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        No data available for radar chart
      </div>
    );
  }

  const keys = config.dataMapping.valueColumns;

  return (
    <ResponsiveRadar
      data={data}
      keys={keys}
      indexBy={config.dataMapping.indexBy}
      margin={config.margin || { top: 70, right: 80, bottom: 40, left: 80 }}
      maxValue={config.maxValue || 'auto'}
      curve={config.curve || 'linearClosed'}
      gridLevels={config.gridLevels || 5}
      gridShape={config.gridShape || 'circular'}
      gridLabelOffset={config.gridLabelOffset || 16}
      enableDots={config.enableDots !== false}
      dotSize={config.dotSize || 6}
      dotColor={config.dotColor || { theme: 'background' }}
      dotBorderWidth={config.dotBorderWidth || 2}
      dotBorderColor={config.dotBorderColor || { from: 'color' }}
      enableDotLabel={config.enableDotLabel || false}
      dotLabel={config.dotLabel || 'value'}
      dotLabelYOffset={config.dotLabelYOffset || -12}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      fillOpacity={config.fillOpacity || 0.25}
      blendMode={config.blendMode || 'normal'}
      legends={config.legends?.map(legend => ({
        anchor: legend.anchor,
        direction: legend.direction,
        translateX: legend.translateX || 0,
        translateY: legend.translateY || 0,
        itemWidth: legend.itemWidth || 80,
        itemHeight: legend.itemHeight || 20,
        itemTextColor: '#999',
        symbolSize: legend.symbolSize || 12,
        symbolShape: legend.symbolShape || 'circle'
      })) || []}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 