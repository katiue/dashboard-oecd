import React from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import type { HeatmapChartConfig } from './HeatmapSchema';

interface HeatmapRendererProps {
  data: any[];
  config: HeatmapChartConfig;
  theme?: any;
}

export const HeatmapRenderer: React.FC<HeatmapRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        No data available for heatmap
      </div>
    );
  }

  // Transform data to Nivo heatmap format - each row should have an 'id' and data keys
  const processedData = data.map(item => {
    const result: any = { id: item.y };
    result[item.x] = item.v;
    return result;
  });

  // Group by Y values and combine X values
  const groupedData = processedData.reduce((acc: Record<string, any>, item) => {
    const id = item.id;
    if (!acc[id]) {
      acc[id] = { id };
    }
    Object.keys(item).forEach(key => {
      if (key !== 'id') {
        acc[id][key] = item[key];
      }
    });
    return acc;
  }, {});

  const nivoData = Object.values(groupedData);

  return (
    <ResponsiveHeatMap
      data={nivoData}
      margin={config.margin || { top: 60, right: 90, bottom: 60, left: 90 }}
      forceSquare={config.forceSquare || false}
      opacity={config.cellOpacity || 1}
      borderWidth={config.cellBorderWidth || 0}
      borderColor={config.cellBorderColor || { from: 'color', modifiers: [['darker', 0.4]] }}
      enableLabels={config.enableLabels !== false}
      labelTextColor={config.labelTextColor || { from: 'color', modifiers: [['darker', 1.8]] }}
      colors={{ scheme: 'blues', type: 'quantize' }}
      axisTop={config.axisTop}
      axisRight={config.axisRight}
      axisBottom={config.axisBottom || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -90,
        legend: config.dataMapping.xColumn,
        legendOffset: 36
      }}
      axisLeft={config.axisLeft || {
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: config.dataMapping.yColumn,
        legendPosition: 'middle',
        legendOffset: -40
      }}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 