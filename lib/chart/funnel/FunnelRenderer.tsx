import React from 'react';
import { ResponsiveFunnel } from '@nivo/funnel';
import type { FunnelChartConfig } from './FunnelSchema';

interface FunnelRendererProps {
  data: any[];
  config: FunnelChartConfig;
  theme?: any;
}

export const FunnelRenderer: React.FC<FunnelRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        No data available for funnel chart
      </div>
    );
  }

  return (
    <ResponsiveFunnel
      data={data}
      margin={config.margin || { top: 20, right: 20, bottom: 20, left: 20 }}
      spacing={config.spacing || 0}
      shapeBlending={config.shapeBlending || 0.66}
      beforeSeparatorLength={config.beforeSeparatorLength || 0}
      beforeSeparatorOffset={config.beforeSeparatorOffset || 0}
      afterSeparatorLength={config.afterSeparatorLength || 0}
      afterSeparatorOffset={config.afterSeparatorOffset || 0}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      enableLabel={config.enableLabel !== false}
      labelColor={config.labelColor || { from: 'color', modifiers: [['darker', 3]] }}
      borderWidth={config.borderWidth || 20}
      borderColor={config.borderColor || { from: 'color', modifiers: [['darker', 0.2]] }}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 