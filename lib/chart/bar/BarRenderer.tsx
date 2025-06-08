import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import type { BarChartConfig } from './BarSchema';

interface BarRendererProps {
  data: any[];
  config: BarChartConfig;
  theme?: any;
}

export const BarRenderer: React.FC<BarRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        No data available for bar chart
      </div>
    );
  }

  const keys = config.dataMapping.valueColumns;

  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy={config.dataMapping.indexBy}
      margin={config.margin || { top: 50, right: 130, bottom: 50, left: 60 }}
      padding={config.padding || 0.3}
      innerPadding={config.innerPadding || 0}
      layout={config.layout || 'vertical'}
      groupMode={config.groupMode || 'grouped'}
      valueScale={config.valueScale || { type: 'linear' }}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      enableLabel={config.enableLabel || false}
      label={config.label || 'value'}
      labelSkipWidth={config.labelSkipWidth || 12}
      labelSkipHeight={config.labelSkipHeight || 12}
      labelTextColor={config.labelTextColor || '#333333'}
      enableGridX={config.enableGridX || false}
      enableGridY={config.enableGridY || true}
      axisTop={config.axisTop}
      axisRight={config.axisRight}
      axisBottom={config.axisBottom || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: config.dataMapping.indexBy,
        legendPosition: 'middle',
        legendOffset: 32
      }}
      axisLeft={config.axisLeft || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Value',
        legendPosition: 'middle',
        legendOffset: -40
      }}
      legends={config.legends?.map(legend => ({
        dataFrom: 'keys' as const,
        anchor: legend.anchor,
        direction: legend.direction,
        justify: legend.justify || false,
        translateX: legend.translateX || 0,
        translateY: legend.translateY || 0,
        itemsSpacing: legend.itemsSpacing || 0,
        itemWidth: legend.itemWidth || 100,
        itemHeight: legend.itemHeight || 18,
        itemDirection: legend.itemDirection || 'left-to-right',
        itemOpacity: legend.itemOpacity || 1,
        symbolSize: legend.symbolSize || 12,
        symbolShape: legend.symbolShape || 'square'
      })) || []}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 