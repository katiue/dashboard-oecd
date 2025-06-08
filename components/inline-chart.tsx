import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from '@/components/icons';
import { UnifiedChartRenderer, type ChartType, type ChartConfig } from '@/lib/chart/UnifiedChartRenderer';

interface InlineChartProps {
  chartType: ChartType;
  title: string;
  description?: string;
  data: any[];
  chartId?: string;
  config?: ChartConfig;
  metadata?: {
    originalDataCount?: number;
    transformedDataCount?: number;
    dataFields?: string[];
  };
}

export function InlineChart({
  chartType,
  title,
  description,
  data,
  chartId,
  config,
  metadata,
}: InlineChartProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // Create a comprehensive configuration object that includes all attributes
  const fullConfiguration = {
    // Basic chart properties
    chartType,
    title,
    description,
    chartId,
    
    // Chart configuration (from config prop)
    ...config,
    
    // Metadata
    metadata,
    
    // Runtime information
    dataPointsCount: Array.isArray(data) ? data.length : 0,
    hasData: data && Array.isArray(data) && data.length > 0,
    
    // All possible chart attributes with their current values (using type-safe access)
    allAttributes: {
      // Basic properties
      animate: (config as any)?.animate,
      theme: (config as any)?.theme,
      
      // Colors and styling
      colors: config?.colors,
      margin: config?.margin,
      
      // Scale configurations (type-safe access)
      xScale: (config as any)?.xScale,
      yScale: (config as any)?.yScale,
      
      // Chart-specific properties (type-safe access)
      nodeSize: (config as any)?.nodeSize,
      useMesh: (config as any)?.useMesh,
      enablePoints: (config as any)?.enablePoints,
      pointSize: (config as any)?.pointSize,
      enableCrosshair: (config as any)?.enableCrosshair,
      innerRadius: (config as any)?.innerRadius,
      enableLabels: (config as any)?.enableLabels,
      curve: (config as any)?.curve,
      
      // Grid and axes
      enableGridX: (config as any)?.enableGridX,
      enableGridY: (config as any)?.enableGridY,
      axisTop: (config as any)?.axisTop,
      axisRight: (config as any)?.axisRight,
      axisBottom: (config as any)?.axisBottom,
      axisLeft: (config as any)?.axisLeft,
      
      // Legends
      legends: (config as any)?.legends,
      
      // Data mapping
      dataMapping: config?.dataMapping,
      
      // Chart type specific properties (using type-safe access)
      ...(chartType === 'bar' && {
        layout: (config as any)?.layout,
        groupMode: (config as any)?.groupMode,
        padding: (config as any)?.padding,
        innerPadding: (config as any)?.innerPadding,
        valueScale: (config as any)?.valueScale,
        enableLabel: (config as any)?.enableLabel,
        label: (config as any)?.label,
        labelSkipWidth: (config as any)?.labelSkipWidth,
        labelSkipHeight: (config as any)?.labelSkipHeight,
        labelTextColor: (config as any)?.labelTextColor,
      }),
      
      ...(chartType === 'line' && {
        lineWidth: (config as any)?.lineWidth,
        pointColor: (config as any)?.pointColor,
        pointBorderWidth: (config as any)?.pointBorderWidth,
        pointBorderColor: (config as any)?.pointBorderColor,
        enablePointLabel: (config as any)?.enablePointLabel,
        pointLabel: (config as any)?.pointLabel,
        pointLabelYOffset: (config as any)?.pointLabelYOffset,
        enableArea: (config as any)?.enableArea,
        areaBaselineValue: (config as any)?.areaBaselineValue,
        areaOpacity: (config as any)?.areaOpacity,
        crosshairType: (config as any)?.crosshairType,
      }),
      
      ...(chartType === 'pie' && {
        startAngle: (config as any)?.startAngle,
        endAngle: (config as any)?.endAngle,
        fit: (config as any)?.fit,
        padAngle: (config as any)?.padAngle,
        cornerRadius: (config as any)?.cornerRadius,
        sortByValue: (config as any)?.sortByValue,
        enableArcLabels: (config as any)?.enableArcLabels,
        arcLabel: (config as any)?.arcLabel,
        arcLabelsSkipAngle: (config as any)?.arcLabelsSkipAngle,
        arcLabelsTextColor: (config as any)?.arcLabelsTextColor,
        arcLabelsRadiusOffset: (config as any)?.arcLabelsRadiusOffset,
        enableArcLinkLabels: (config as any)?.enableArcLinkLabels,
        arcLinkLabel: (config as any)?.arcLinkLabel,
        arcLinkLabelsSkipAngle: (config as any)?.arcLinkLabelsSkipAngle,
        arcLinkLabelsTextColor: (config as any)?.arcLinkLabelsTextColor,
        arcLinkLabelsThickness: (config as any)?.arcLinkLabelsThickness,
        arcLinkLabelsColor: (config as any)?.arcLinkLabelsColor,
      }),
      
      ...(chartType === 'heatmap' && {
        forceSquare: (config as any)?.forceSquare,
        sizeVariation: (config as any)?.sizeVariation,
        cellOpacity: (config as any)?.cellOpacity,
        cellBorderColor: (config as any)?.cellBorderColor,
        cellBorderWidth: (config as any)?.cellBorderWidth,
        cellShape: (config as any)?.cellShape,
        colorScale: (config as any)?.colorScale,
        labelTextColor: (config as any)?.labelTextColor,
      }),
      
      ...(chartType === 'radar' && {
        maxValue: (config as any)?.maxValue,
        gridLevels: (config as any)?.gridLevels,
        gridShape: (config as any)?.gridShape,
        gridLabelOffset: (config as any)?.gridLabelOffset,
        enableDots: (config as any)?.enableDots,
        dotSize: (config as any)?.dotSize,
        dotColor: (config as any)?.dotColor,
        dotBorderWidth: (config as any)?.dotBorderWidth,
        dotBorderColor: (config as any)?.dotBorderColor,
        enableDotLabel: (config as any)?.enableDotLabel,
        dotLabel: (config as any)?.dotLabel,
        dotLabelYOffset: (config as any)?.dotLabelYOffset,
        fillOpacity: (config as any)?.fillOpacity,
        blendMode: (config as any)?.blendMode,
      }),
      
      ...(chartType === 'scatter' && {
        debugMesh: (config as any)?.debugMesh,
      }),
      
      ...(chartType === 'areaBump' && {
        align: (config as any)?.align,
        interpolation: (config as any)?.interpolation,
        spacing: (config as any)?.spacing,
        xPadding: (config as any)?.xPadding,
        startLabel: (config as any)?.startLabel,
        startLabelPadding: (config as any)?.startLabelPadding,
        startLabelTextColor: (config as any)?.startLabelTextColor,
        endLabel: (config as any)?.endLabel,
        endLabelPadding: (config as any)?.endLabelPadding,
        endLabelTextColor: (config as any)?.endLabelTextColor,
      }),
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">            <CardTitle className="text-lg">{title}</CardTitle>
            {chartId && (
              <div className="text-xs text-muted-foreground font-mono">
                ID: {chartId}
              </div>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {metadata && (
              <div className="text-xs text-muted-foreground">
                {metadata.transformedDataCount} data points
                {metadata.originalDataCount &&
                  metadata.originalDataCount !== metadata.transformedDataCount &&
                  ` (from ${metadata.originalDataCount} total)`}
              </div>
            )}
          </div>

          {/* Chart Details Toggle */}
          <div className="flex flex-col items-end">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 shrink-0"
              title="View chart details"
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            >
              <div 
                className={`transition-transform duration-200 ${
                  isDetailsExpanded ? 'rotate-180' : ''
                }`}
              >
                <ChevronDownIcon size={16} />
              </div>
            </Button>
            
            {isDetailsExpanded && (
              <div className="mt-3 w-96 border rounded-lg p-3 bg-muted/50">
                <div className="space-y-4">
                  {/* Configuration Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Chart Configuration</span>
                      <span className="text-xs text-muted-foreground">
                        {chartType} chart
                      </span>
                    </div>
                    <div className="max-h-48 overflow-auto border rounded bg-background/50 p-2">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {JSON.stringify(fullConfiguration, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  {/* Data Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Chart Data</span>
                      <span className="text-xs text-muted-foreground">
                        {Array.isArray(data) ? data.length : 0} items
                      </span>
                    </div>
                    <div className="max-h-48 overflow-auto border rounded bg-background/50 p-2">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
        <CardContent>
        <div 
          style={{ height: 300 }}
          data-chart-id={chartId}
          data-testid={chartId ? `chart-${chartId}` : undefined}
        >
          {data && Array.isArray(data) && data.length > 0 ? (
            <UnifiedChartRenderer
              chartType={chartType}
              data={data}
              config={config as ChartConfig}
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <p className="text-muted-foreground">No data available for this chart</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 