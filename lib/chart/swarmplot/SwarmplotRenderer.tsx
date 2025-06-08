import React from 'react';
import { ResponsiveSwarmPlot } from '@nivo/swarmplot';
import type { SwarmplotChartConfig } from './SwarmplotSchema';

interface SwarmplotRendererProps {
  data: any[];
  config: SwarmplotChartConfig;
  theme?: any;
}

export const SwarmplotRenderer: React.FC<SwarmplotRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        No data available for swarmplot chart
      </div>
    );
  }

  return (
    <ResponsiveSwarmPlot
      data={data}
      groups={config.groups || []}
      value="value"
      valueFormat=" >-.2f"
      valueScale={{ type: 'linear', min: 'auto', max: 'auto' }}
      size={{ key: 'volume', values: [4, 20], sizes: [6, 20] }}
      layout={config.layout || 'horizontal'}
      gap={config.gap || 10}
      forceStrength={config.forceStrength || 4}
      simulationIterations={config.simulationIterations || 100}
      spacing={config.spacing || 2}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      margin={config.margin || { top: 80, right: 100, bottom: 80, left: 100 }}
      axisTop={config.axisTop}
      axisRight={config.axisRight}
      axisBottom={config.axisBottom || {
        tickSize: 10,
        tickPadding: 5,
        tickRotation: 0,
        legend: config.dataMapping.value,
        legendPosition: 'middle',
        legendOffset: 46
      }}
      axisLeft={config.axisLeft || {
        tickSize: 10,
        tickPadding: 5,
        tickRotation: 0,
        legend: config.dataMapping.groupBy,
        legendPosition: 'middle',
        legendOffset: -76
      }}
      annotations={config.annotations || []}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 