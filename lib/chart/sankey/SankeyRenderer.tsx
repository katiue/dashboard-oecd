import React from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import type { SankeyChartConfig } from './SankeySchema';

interface SankeyRendererProps {
  data: any;
  config: SankeyChartConfig;
  theme?: any;
}

export const SankeyRenderer: React.FC<SankeyRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || !data.nodes || !data.links || data.nodes.length === 0 || data.links.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        No data available for sankey diagram
      </div>
    );
  }

  return (
    <ResponsiveSankey
      data={data}
      margin={config.margin || { top: 40, right: 160, bottom: 40, left: 50 }}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'category10' }}
      enableLabels={config.enableLabels !== false}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 