import React from 'react';
import { ResponsiveChord } from '@nivo/chord';
import type { ChordChartConfig } from './ChordSchema';

interface ChordRendererProps {
  data: any;
  config: ChordChartConfig;
  theme?: any;
}

export const ChordRenderer: React.FC<ChordRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || !data.matrix || data.matrix.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No data available for chord diagram
      </div>
    );
  }

  return (
    <ResponsiveChord
      data={data.matrix}
      keys={data.keys}
      margin={config.margin || { top: 60, right: 60, bottom: 60, left: 60 }}
      padAngle={config.padAngle || 0.02}
      innerRadiusRatio={config.innerRadiusRatio || 0.96}
      innerRadiusOffset={config.innerRadiusOffset || 0.01}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      enableLabel={config.enableLabel !== false}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 