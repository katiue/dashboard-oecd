import React from 'react';
import { ResponsiveBullet } from '@nivo/bullet';
import type { BulletChartConfig } from './BulletSchema';

interface BulletRendererProps {
  data: any[];
  config: BulletChartConfig;
  theme?: any;
}

export const BulletRenderer: React.FC<BulletRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No data available for bullet chart
      </div>
    );
  }

  return (
    <ResponsiveBullet
      data={data}
      margin={config.margin || { top: 50, right: 90, bottom: 50, left: 90 }}
      spacing={config.spacing || 30}
      layout={config.layout || 'horizontal'}
      measureSize={config.measureSize || 0.6}
      markerSize={config.markerSize || 0.8}
      rangeColors={config.rangeColors || ['#eee', '#ccc', '#aaa']}
      measureColors={config.measureColor ? [config.measureColor] : ['#666']}
      markerColors={config.markerColors || ['#000']}
      titleAlign={config.titleAlign || 'start'}
      titleOffsetX={config.titleOffsetX || 0}
      titleOffsetY={config.titleOffsetY || 0}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 