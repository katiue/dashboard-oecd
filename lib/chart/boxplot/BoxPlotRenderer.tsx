import React from 'react';
import { ResponsiveBoxPlot } from '@nivo/boxplot';
import type { BoxPlotChartConfig } from './BoxPlotSchema';

interface BoxPlotRendererProps {
  data: any[];
  config: BoxPlotChartConfig;
  theme?: any;
}

export const BoxPlotRenderer: React.FC<BoxPlotRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        No data available for box plot
      </div>
    );
  }

  return (
    <ResponsiveBoxPlot
      data={data}
      margin={config.margin || { top: 60, right: 140, bottom: 60, left: 60 }}
      minValue="auto"
      maxValue="auto"
      groupBy="group"
      value="value"
      subGroupBy={config.dataMapping.subGroup}
      padding={config.groupSpacing || 0.12}
      enableGridX={true}
      enableGridY={true}
      borderRadius={config.borderRadius || 2}
      borderWidth={config.borderWidth || 1}
      borderColor={config.borderColor || { from: 'color', modifiers: [['darker', 0.6]] }}
      medianWidth={config.medianWidth || 2}
      medianColor={config.medianColor || { from: 'color', modifiers: [['darker', 0.3]] }}
      whiskerEndSize={0.6}
      whiskerColor={config.whiskerColor || { from: 'color' }}
      opacity={0.8}
      whiskerWidth={config.whiskerWidth || 1}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      axisTop={config.axisTop}
      axisRight={config.axisRight}
      axisBottom={config.axisBottom || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: config.dataMapping.groupBy,
        legendPosition: 'middle',
        legendOffset: 32
      }}
      axisLeft={config.axisLeft || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: config.dataMapping.value,
        legendPosition: 'middle',
        legendOffset: -40
      }}
      legends={config.legends as any}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 