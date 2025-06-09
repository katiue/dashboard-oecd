import React from 'react';
import { ResponsiveVoronoi } from '@nivo/voronoi';
import type { VoronoiChartConfig } from './VoronoiSchema';

interface VoronoiRendererProps {
  data: any[];
  config: VoronoiChartConfig;
  theme?: any;
}

export const VoronoiRenderer: React.FC<VoronoiRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No data available for voronoi chart
      </div>
    );
  }

  return (
    <ResponsiveVoronoi
      data={data}
      xDomain={config.xDomain || [-1, 1]}
      yDomain={config.yDomain || [-1, 1]}
      margin={config.margin || { top: 1, right: 1, bottom: 1, left: 1 }}
      theme={theme}
    />
  );
}; 