import React from 'react';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import type { CirclePackingChartConfig } from './CirclePackingSchema';

interface CirclePackingRendererProps {
  data: any;
  config: CirclePackingChartConfig;
  theme?: any;
}

export const CirclePackingRenderer: React.FC<CirclePackingRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || !data.children || data.children.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No data available for circle packing
      </div>
    );
  }

  return (
    <ResponsiveCirclePacking
      data={data}
      margin={config.margin || { top: 20, right: 20, bottom: 20, left: 20 }}
      padding={config.padding || 3}
      leavesOnly={config.leavesOnly || false}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      enableLabels={config.enableLabels !== false}
      label={config.label || 'id'}
      labelsSkipRadius={config.labelsSkipRadius || 8}
      labelTextColor={config.labelTextColor || { from: 'color', modifiers: [['darker', 2]] }}
      borderWidth={config.borderWidth || 1}
      borderColor={config.borderColor || { from: 'color', modifiers: [['darker', 0.4]] }}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 