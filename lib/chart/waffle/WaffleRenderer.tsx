import React from 'react';
import { ResponsiveWaffle } from '@nivo/waffle';
import type { WaffleChartConfig } from './WaffleSchema';

interface WaffleRendererProps {
  data: any[];
  config: WaffleChartConfig;
  theme?: any;
}

export const WaffleRenderer: React.FC<WaffleRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No data available for waffle chart
      </div>
    );
  }

  return (
    <ResponsiveWaffle
      data={data}
      total={config.total || 100}
      rows={config.rows || 10}
      columns={config.columns || 10}
      margin={config.margin || { top: 10, right: 10, bottom: 10, left: 10 }}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      borderRadius={config.borderRadius || 3}
      borderWidth={config.borderWidth || 1}
      borderColor={config.borderColor || { from: 'color', modifiers: [['darker', 0.3]] }}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 