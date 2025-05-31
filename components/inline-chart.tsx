import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChartRenderer, { type ChartType } from '@/lib/chart/ChartRenderer';

interface InlineChartProps {
  chartType: ChartType;
  title: string;
  description?: string;
  data: any[];
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
  metadata,
}: InlineChartProps) {
  // default Nivo theme for tooltips (dark background, white text)
  const defaultChartTheme = {
    tooltip: {
      container: {
        background: 'rgba(0,0,0,0.75)',
        color: '#fff',
        fontSize: '12px',
      },
    },
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
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
      </CardHeader>
      <CardContent>
        <div style={{ height: 300 }}>
          {data && Array.isArray(data) && data.length > 0 ? (
            <ChartRenderer
              chartType={chartType}
              data={data}
              theme={defaultChartTheme}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-muted-foreground">No data available for this chart</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 