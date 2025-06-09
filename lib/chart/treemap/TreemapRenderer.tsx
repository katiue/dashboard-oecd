import React from 'react';
import { ResponsiveTreeMap } from '@nivo/treemap';
import type { TreemapChartConfig } from './TreemapSchema';

interface TreemapRendererProps {
  data: any;
  config: TreemapChartConfig;
  theme?: any;
}

export const TreemapRenderer: React.FC<TreemapRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || !data.children || data.children.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No data available for treemap chart
      </div>
    );
  }

  return (
    <ResponsiveTreeMap
      data={data}
      identity="id"
      value="value"
      valueFormat=".02s"
      margin={config.margin || { top: 10, right: 10, bottom: 10, left: 10 }}
      labelSkipSize={config.labelSkipSize || 12}
      labelTextColor={config.labelTextColor || { from: 'color', modifiers: [['darker', 1.2]] }}
      parentLabelSize={config.parentLabelSize || 16}
      parentLabelTextColor={config.parentLabelTextColor || { from: 'color', modifiers: [['darker', 2]] }}
      borderColor={config.borderColor || { from: 'color', modifiers: [['darker', 0.1]] }}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      tile={config.tile || 'squarify'}
      innerPadding={config.innerPadding || 3}
      outerPadding={config.outerPadding || 3}
      leavesOnly={config.leavesOnly || false}
      enableLabel={config.enableLabel !== false}
      label={config.label || 'id'}
      orientLabel={config.orientLabel || false}
      enableParentLabel={config.enableParentLabel !== false}
      parentLabel={config.parentLabel || 'id'}
      parentLabelPosition={config.parentLabelPosition || 'top'}
      parentLabelPadding={config.parentLabelPadding || 6}
      borderWidth={config.borderWidth || 0}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 