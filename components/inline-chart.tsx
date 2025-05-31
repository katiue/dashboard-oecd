import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from '@/components/icons';
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
  const [isDataExpanded, setIsDataExpanded] = useState(false);

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
        <div className="flex items-start justify-between">
          <div className="flex-1">
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
          </div>

          {/* Data Viewer Toggle */}
          <div className="flex flex-col items-end">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 shrink-0"
              title="View chart data"
              onClick={() => setIsDataExpanded(!isDataExpanded)}
            >
              <div 
                className={`transition-transform duration-200 ${
                  isDataExpanded ? 'rotate-180' : ''
                }`}
              >
                <ChevronDownIcon size={16} />
              </div>
            </Button>
            
            {isDataExpanded && (
              <div className="mt-3 w-80 border rounded-lg p-3 bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Chart Data</span>
                  <span className="text-xs text-muted-foreground">
                    {Array.isArray(data) ? data.length : 0} items
                  </span>
                </div>
                <div className="max-h-48 overflow-auto">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
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
            <div className="flex size-full items-center justify-center">
              <p className="text-muted-foreground">No data available for this chart</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 