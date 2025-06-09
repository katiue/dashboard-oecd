import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import type { PieChartConfig } from './PieSchema';

interface PieRendererProps {
  data: any[];
  config: PieChartConfig;
  theme?: any;
}

export const PieRenderer: React.FC<PieRendererProps> = ({
  data,
  config,
  theme
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No data available for pie chart
      </div>
    );
  }

  return (
    <ResponsivePie
      data={data}
      margin={config.margin || { top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={config.innerRadius || 0.5}
      padAngle={config.padAngle || 0.7}
      cornerRadius={config.cornerRadius || 3}
      startAngle={config.startAngle || 0}
      endAngle={config.endAngle || 360}
      colors={config.colors?.scheme ? { scheme: config.colors.scheme } : { scheme: 'nivo' }}
      borderWidth={config.borderWidth || 1}
      borderColor={config.borderColor || { from: 'color' }}
      enableArcLabels={config.enableArcLabels !== false}
      arcLabel={config.arcLabel || 'formattedValue'}
      arcLabelsSkipAngle={config.arcLabelsSkipAngle || 10}
      arcLabelsTextColor={config.arcLabelsTextColor || {
        from: 'color',
        modifiers: [
          ['darker', 2]
        ]
      }}
      arcLabelsRadiusOffset={config.arcLabelsRadiusOffset || 0.4}
      enableArcLinkLabels={config.enableArcLinkLabels !== false}
      arcLinkLabel={config.arcLinkLabel || 'id'}
      arcLinkLabelsSkipAngle={config.arcLinkLabelsSkipAngle || 10}
      arcLinkLabelsTextColor={config.arcLinkLabelsTextColor || theme?.text?.color || '#333333'}
      arcLinkLabelsThickness={config.arcLinkLabelsThickness || 2}
      arcLinkLabelsColor={config.arcLinkLabelsColor || { from: 'color' }}
      arcLinkLabelsOffset={config.arcLinkLabelsOffset || 0}
      arcLinkLabelsDiagonalLength={config.arcLinkLabelsDiagonalLength || 16}
      arcLinkLabelsStraightLength={config.arcLinkLabelsStraightLength || 24}
      legends={config.legends?.map(legend => ({
        anchor: legend.anchor,
        direction: legend.direction,
        justify: legend.justify || false,
        translateX: legend.translateX || 0,
        translateY: legend.translateY || 0,
        itemsSpacing: legend.itemsSpacing || 0,
        itemWidth: legend.itemWidth || 100,
        itemHeight: legend.itemHeight || 18,
        itemDirection: legend.itemDirection || 'left-to-right',
        itemOpacity: legend.itemOpacity || 1,
        symbolSize: legend.symbolSize || 12,
        symbolShape: legend.symbolShape || 'circle'
      })) || []}
      animate={config.animate !== false}
      theme={theme}
    />
  );
}; 