import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import type { LineChartConfig } from './LineSchema';

interface LineRendererProps {
  data: any[];
  config: LineChartConfig;
  theme?: any;
}

export const LineRenderer: React.FC<LineRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        No data available for line chart
      </div>
    );
  }

  return (
    <ResponsiveLine
      data={data}
      margin={config.margin || { top: 50, right: 110, bottom: 50, left: 60 }}
      curve={config.curve || 'linear'}
      lineWidth={config.lineWidth || 2}
      xScale={config.xScale || { type: 'point' }}
      yScale={config.yScale || { type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      enablePoints={config.enablePoints !== false}
      pointSize={config.pointSize || 8}
      pointColor={config.pointColor || { theme: 'background' }}
      pointBorderWidth={config.pointBorderWidth || 2}
      pointBorderColor={config.pointBorderColor || { from: 'serieColor' }}
      enablePointLabel={config.enablePointLabel || false}
      pointLabel={config.pointLabel || 'y'}
      pointLabelYOffset={config.pointLabelYOffset || -12}
      enableArea={config.enableArea || false}
      areaOpacity={config.areaOpacity || 0.2}
      enableGridX={config.enableGridX !== false}
      enableGridY={config.enableGridY !== false}
      enableCrosshair={config.enableCrosshair || false}
      crosshairType={config.crosshairType || 'cross'}
      axisTop={config.axisTop}
      axisRight={config.axisRight}
      axisBottom={config.axisBottom || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: config.dataMapping.xColumn,
        legendOffset: 36,
        legendPosition: 'middle'
      }}
      axisLeft={config.axisLeft || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Value',
        legendOffset: -40,
        legendPosition: 'middle'
      }}
      legends={config.legends?.map(legend => ({
        anchor: legend.anchor,
        direction: legend.direction,
        justify: legend.justify || false,
        translateX: legend.translateX || 0,
        translateY: legend.translateY || 0,
        itemsSpacing: legend.itemsSpacing || 0,
        itemWidth: legend.itemWidth || 80,
        itemHeight: legend.itemHeight || 18,
        itemDirection: legend.itemDirection || 'left-to-right',
        itemOpacity: legend.itemOpacity || 1,
        symbolSize: legend.symbolSize || 12,
        symbolShape: legend.symbolShape || 'circle'
      })) || []}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 