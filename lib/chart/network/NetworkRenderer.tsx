import React from 'react';
import { ResponsiveNetwork } from '@nivo/network';
import type { NetworkChartConfig } from './NetworkSchema';

interface NetworkRendererProps {
  data: any;
  config: NetworkChartConfig;
  theme?: any;
}

export const NetworkRenderer: React.FC<NetworkRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No data available for network chart
      </div>
    );
  }

  return (
    <ResponsiveNetwork
      data={data}
      margin={config.margin || { top: 0, right: 0, bottom: 0, left: 0 }}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 