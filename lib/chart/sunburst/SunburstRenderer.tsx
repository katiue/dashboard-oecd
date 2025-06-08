import React from 'react';
import { ResponsiveSunburst } from '@nivo/sunburst';
import type { SunburstChartConfig } from './SunburstSchema';

interface SunburstRendererProps {
  data: any;
  config: SunburstChartConfig;
  theme?: any;
}

export const SunburstRenderer: React.FC<SunburstRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || !data.children || data.children.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        No data available for sunburst chart
      </div>
    );
  }

  return (
    <ResponsiveSunburst
      data={data}
      margin={config.margin || { top: 20, right: 20, bottom: 20, left: 20 }}
      id="name"
      value="value"
      cornerRadius={config.cornerRadius || 2}
      borderWidth={config.borderWidth || 1}
      borderColor={config.borderColor || { theme: 'background' }}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      childColor={config.childColor || { from: 'color' }}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 