'use client';

import React, { useState, useEffect, useMemo, } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FullscreenIcon } from '@/components/icons';
import { UnifiedChartRenderer, type ChartType, type ChartConfig } from '@/lib/chart/UnifiedChartRenderer';
import { processChartData } from '@/lib/chart/UnifiedChartDataProcessor';
import { parse } from 'papaparse';
import { toast } from 'sonner';

// Utility function to get key takeaway text
const getKeyTakeaway = (chart: DashboardChartConfig) => {
  // Combine insights and methodology or use visualization + importance
  if (chart.commentary.insights || chart.commentary.methodology) {
    return `${chart.commentary.insights || ''} ${chart.commentary.methodology || ''}`.trim();
  }
  return `${chart.commentary.visualization} ${chart.commentary.importance}`.trim();
};

interface DashboardChartConfig {
  id: string;
  title: string;
  description: string;
  chartType: ChartType;
  config: ChartConfig;
  commentary: {
    visualization: string;
    importance: string;
    insights?: string;
    methodology?: string;
  };
  data?: any[];
}

interface DataDashboardProps {
  csvData?: string;
  initialCharts?: DashboardChartConfig[];
}

export function DataDashboard({ csvData: initialCsvData, initialCharts }: DataDashboardProps) {
  const [csvData, setCsvData] = useState(initialCsvData || '');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [charts, setCharts] = useState<DashboardChartConfig[]>(initialCharts || []);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // Parse CSV data and extract headers
  const parsedData = useMemo(() => {
    if (!csvData.trim()) return { headers: [], data: [] };
    
    try {
      const parsed = parse(csvData, { 
        header: true, 
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim()
      });
      
      return {
        headers: parsed.meta.fields || [],
        data: parsed.data as Record<string, string>[]
      };
    } catch (error) {
      console.error('Error parsing CSV data:', error);
      return { headers: [], data: [] };
    }
  }, [csvData]);

  // Update headers when data changes
  useEffect(() => {
    setCsvHeaders(parsedData.headers);
  }, [parsedData.headers]);

  // Update charts when initialCharts prop changes (new charts from tool)
  useEffect(() => {
    if (initialCharts && initialCharts.length > 0) {
      setCharts(prevCharts => {
        // Merge existing charts with new ones, avoid duplicates
        const existingIds = new Set(prevCharts.map(chart => chart.id));
        const newCharts = initialCharts.filter(chart => !existingIds.has(chart.id));
        return [...prevCharts, ...newCharts];
      });
    }
  }, [initialCharts]);
  
  // Reset generation flag when CSV data changes
  useEffect(() => {
    if (csvData !== initialCsvData) {
      setCharts([]);
    }
  }, [csvData, initialCsvData]);

  // Process data for charts with filters applied
  const processedChartsData = useMemo(() => {
    if (!charts.length) {
      return [];
    }

    return charts.map(chart => {
      try {
        // If chart already has processed data (from tool), use it
        if (chart.data && Array.isArray(chart.data) && chart.data.length > 0) {
          return chart;
        }

        // If no parsed data available, return chart with empty data
        if (!parsedData.data.length) {
          return {
            ...chart,
            data: []
          };
        }

        const filteredData = parsedData.data;

        // Clean and validate the data before processing
        const cleanedData = filteredData.map(row => {
          const cleanedRow: Record<string, string> = {};
          parsedData.headers.forEach(header => {
            const value = row[header];
            // Clean the value - remove null, undefined, and clean strings
            if (value !== null && value !== undefined) {
              const stringValue = String(value).trim();
              // Replace empty strings with fallback values
              cleanedRow[header] = stringValue || '0';
            } else {
              cleanedRow[header] = '0';
            }
          });
          return cleanedRow;
        });

        // Convert to CSV string for processing
        if (cleanedData.length === 0) {
          return {
            ...chart,
            data: []
          };
        }

        const headers = `${parsedData.headers.join(',')}\n`;
        const dataRows = cleanedData.map(row => 
          parsedData.headers.map(header => {
            const value = row[header] || '0';
            // Escape commas and quotes in CSV
            if (value.includes(',') || value.includes('"')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        ).join('\n');
        const csvString = headers + dataRows;

        const processedData = processChartData(chart.chartType, csvString, chart.config);
        
        // Additional validation for the processed data
        const validatedData = Array.isArray(processedData) ? processedData.map(item => {
          if (!item || typeof item !== 'object') {
            return null;
          }
          
          // Clean numeric values
          const cleanedItem: any = {};
          Object.keys(item).forEach(key => {
            const value = item[key];
            if (typeof value === 'number') {
              // Ensure no NaN, Infinity, or invalid numbers
              cleanedItem[key] = Number.isFinite(value) ? value : 0;
            } else if (typeof value === 'string') {
              // Ensure strings are not empty and properly trimmed
              cleanedItem[key] = value.trim() || 'Unknown';
            } else {
              cleanedItem[key] = value;
            }
          });
          
          return cleanedItem;
        }).filter(Boolean) : [];
        
        return {
          ...chart,
          data: validatedData
        };
      } catch (error) {
        console.error(`Error processing chart ${chart.id}:`, error);
        return {
          ...chart,
          data: []
        };
      }
    });
  }, [charts, parsedData]);

  // Toggle chart full screen
  const toggleFullScreen = (chartId: string) => {
    setExpandedChart(prev => prev === chartId ? null : chartId);
  };

  // Export chart as PNG
  const exportChart = async (chartId: string) => {
    const chartElement = document.querySelector(`[data-chart-id="${chartId}"]`);
    if (chartElement) {
      try {
        // This would require additional setup for actual image export
        toast.success(`Chart ${chartId} export functionality would be implemented here`);
      } catch (error) {
        toast.error('Export failed');
      }
    }
  };



  if (!csvData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Data Visualization Dashboard</h2>
        <div className="text-muted-foreground mb-4">Upload CSV data to begin creating visualizations</div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <Input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const csv = event.target?.result as string;
                  setCsvData(csv);
                };
                reader.readAsText(file);
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (expandedChart) {
    const chart = processedChartsData.find(c => c.id === expandedChart);
    if (chart) {
      return (
        <FullScreenChartView 
          chart={chart}
          onClose={() => setExpandedChart(null)}
          onConfigChange={(updatedChart) => {
            setCharts(prev => prev.map(c => c.id === updatedChart.id ? updatedChart : c));
          }}
        />
      );
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Visualization Dashboard</h1>
          <div className="text-muted-foreground">
            Interactive analysis of your data with {charts.length} visualizations
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">
            {parsedData.data.length} records
          </Badge>
          <Badge variant="secondary">
            {parsedData.headers.length} columns
          </Badge>
        </div>
      </div>

      {/* Charts Grid */}
      {processedChartsData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {processedChartsData.map((chart) => (
            <Card key={chart.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{chart.title}</CardTitle>
                    <div className="text-sm text-muted-foreground">{chart.description}</div>
                    <Badge variant="outline" className="mt-2">
                      {chart.chartType}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportChart(chart.id)}
                      className="p-2"
                    >
                      <DownloadIcon size={16} />
                    </Button> */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFullScreen(chart.id)}
                      className="p-2"
                    >
                      <FullscreenIcon size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Chart Visualization */}
                <div 
                  className="h-80 mb-4"
                  data-chart-id={chart.id}
                >
                  {chart.data && Array.isArray(chart.data) && chart.data.length > 0 ? (
                    <UnifiedChartRenderer
                      chartType={chart.chartType}
                      data={chart.data}
                      config={chart.config}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center border border-dashed rounded">
                      <div className="text-muted-foreground">No data available</div>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-muted-foreground">No charts available. Use the createDashboardChart tool to add visualizations.</div>
        </div>
      )}
    </div>
  );
}

// Full Screen Chart View Component
function FullScreenChartView({ 
  chart, 
  onClose, 
  onConfigChange 
}: { 
  chart: DashboardChartConfig;
  onClose: () => void;
  onConfigChange: (chart: DashboardChartConfig) => void;
}) {
  const [activePanel, setActivePanel] = useState<'config' | 'data'>('config');
  
  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{chart.title}</h2>
            <p className="text-muted-foreground">{chart.description}</p>
            {/* Show processing info if available */}
            {(chart as any).metadata?.originalSource && (
              <div className="text-xs text-muted-foreground mt-1">
                Source: {(chart as any).metadata.originalSource} | 
                Processed: {(chart as any).metadata.dataShape?.[0]} rows × {(chart as any).metadata.dataShape?.[1]} cols
              </div>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Main Content Area - Split Layout with Scrolling */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chart Area - Left Side */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="min-h-full" data-chart-id={`fullscreen-${chart.id}`}>
              {chart.data && Array.isArray(chart.data) && chart.data.length > 0 ? (
                <div className="h-96 min-h-96 mb-6">
                  <UnifiedChartRenderer
                    chartType={chart.chartType}
                    data={chart.data}
                    config={chart.config}
                  />
                </div>
              ) : (
                <div className="flex h-96 w-full items-center justify-center border border-dashed rounded mb-6">
                  <div className="text-muted-foreground">No data available</div>
                </div>
              )}
              
              {/* Enhanced Key Takeaway and Processing Info */}
              <div className="space-y-4">
                <div className="p-4 border rounded bg-muted/50">
                  <h4 className="font-semibold mb-2">Key Takeaway</h4>
                  <div className="text-sm text-muted-foreground">
                    {getKeyTakeaway(chart)}
                  </div>
                </div>
                
                {/* Processing Steps if available */}
                {(chart as any).processingSteps && (
                  <div className="p-4 border rounded bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Data Processing Pipeline</h4>
                    <div className="text-sm space-y-1">
                      {(chart as any).processingSteps.map((step: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <span className="size-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">{index + 1}</span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Statistical Analysis if available */}
                {(chart as any).statisticalAnalysis && (
                  <div className="p-4 border rounded bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Statistical Insights</h4>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {(chart as any).statisticalAnalysis.summary?.join('. ') || 'Statistical analysis completed.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Panel - Configuration and Data */}
          <div className="w-80 border-l bg-muted overflow-hidden flex flex-col">
            {/* Panel Tabs */}
            <div className="flex border-b bg-background">
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activePanel === 'config' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted-foreground/10'
                }`}
                onClick={() => setActivePanel('config')}
              >
                Configuration
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activePanel === 'data' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted-foreground/10'
                }`}
                onClick={() => setActivePanel('data')}
              >
                Data
              </button>
            </div>
            
            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activePanel === 'config' ? (
                <ChartConfigPanel 
                  chart={chart}
                  onChange={onConfigChange}
                />
              ) : (
                <CsvDataPanel chart={chart} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// CSV Data Panel Component
function CsvDataPanel({ chart }: { chart: DashboardChartConfig }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get CSV data from enhanced chart or convert existing data
  const csvData = (chart as any).processedCsvData || convertDataToCsv(chart.data || []);
  const lines = csvData.split('\n').filter((line: string) => line.trim());
  const headers = lines[0]?.split(',') || [];
  const dataRows = lines.slice(1);
  
  // Filter data based on search term
  const filteredRows = searchTerm 
    ? dataRows.filter((row: string) => row.toLowerCase().includes(searchTerm.toLowerCase()))
    : dataRows;
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Processed Data</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {dataRows.length} rows × {headers.length} columns
        </p>
        
        {/* Search */}
        <Input
          placeholder="Search data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
      </div>
      
      {/* Data Table */}
      <div className="border rounded-md">
        {/* Headers */}
        <div className="bg-muted/50 border-b overflow-x-auto">
          <div className="flex min-w-max">
            {headers.map((header: string, index: number) => (
              <div 
                key={index} 
                className="px-3 py-2 text-xs font-medium text-muted-foreground border-r last:border-r-0 min-w-24"
              >
                {header.replace(/"/g, '')}
              </div>
            ))}
          </div>
        </div>
        
        {/* Data Rows */}
        <div className="max-h-96 overflow-y-auto">
          {filteredRows.slice(0, 100).map((row: string, rowIndex: number) => {
            const cells = row.split(',');
            return (
              <div key={rowIndex} className="flex min-w-max border-b last:border-b-0 hover:bg-muted/30">
                {cells.map((cell: string, cellIndex: number) => (
                  <div 
                    key={cellIndex} 
                    className="px-3 py-2 text-xs border-r last:border-r-0 min-w-24"
                    title={cell.replace(/"/g, '')}
                  >
                    <div className="truncate">
                      {cell.replace(/"/g, '')}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        
        {/* Show more indicator */}
        {filteredRows.length > 100 && (
          <div className="p-2 text-center text-xs text-muted-foreground bg-muted/30">
            Showing first 100 rows of {filteredRows.length} filtered results
          </div>
        )}
      </div>
      
      {/* Data Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(csvData);
            toast.success('CSV data copied to clipboard');
          }}
        >
          Copy CSV
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${chart.title.replace(/\s+/g, '_')}_data.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download CSV
        </Button>
      </div>
      
      {/* Processing Metadata */}
      {(chart as any).metadata && (
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Processing Metadata</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>Original Source: {(chart as any).metadata.originalSource}</div>
            <div>Processed: {(chart as any).metadata.processedAt}</div>
            <div>Shape: {(chart as any).metadata.dataShape?.[0]} × {(chart as any).metadata.dataShape?.[1]}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to convert data to CSV if not available
function convertDataToCsv(data: any[]): string {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '';
  }
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

// Chart Configuration Panel Component
function ChartConfigPanel({ 
  chart, 
  onChange 
}: { 
  chart: DashboardChartConfig;
  onChange: (chart: DashboardChartConfig) => void;
}) {
  const [localConfig, setLocalConfig] = useState<ChartConfig>(chart.config);

  const updateConfig = (updates: Partial<typeof localConfig>) => {
    const newConfig = { ...localConfig, ...updates } as ChartConfig;
    setLocalConfig(newConfig);
    onChange({ ...chart, config: newConfig });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Chart Configuration</h3>
      
      {/* Title */}
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input
          value={chart.title}
          onChange={(e) => onChange({ ...chart, title: e.target.value })}
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={chart.description}
          onChange={(e) => onChange({ ...chart, description: e.target.value })}
        />
      </div>

      {/* Color Scheme */}
      <div>
        <label className="text-sm font-medium">Color Scheme</label>
        <select
          className="w-full mt-1 p-2 border rounded"
          value={typeof localConfig.colors === 'object' && !Array.isArray(localConfig.colors) && localConfig.colors?.scheme ? localConfig.colors.scheme : 'nivo'}
          onChange={(e) => updateConfig({ 
            colors: { 
              scheme: e.target.value as any 
            }
          })}
        >
          <option value="nivo">Nivo</option>
          <option value="category10">Category 10</option>
          <option value="accent">Accent</option>
          <option value="dark2">Dark 2</option>
          <option value="paired">Paired</option>
          <option value="pastel1">Pastel 1</option>
          <option value="pastel2">Pastel 2</option>
          <option value="set1">Set 1</option>
          <option value="set2">Set 2</option>
          <option value="set3">Set 3</option>
        </select>
      </div>

      {/* Chart-specific configurations */}
      {chart.chartType === 'bar' && (
        <BarChartConfig 
          config={localConfig as Extract<ChartConfig, { chartType: 'bar' }>} 
          onChange={(updates) => updateConfig(updates)} 
        />
      )}
      
      {chart.chartType === 'line' && (
        <LineChartConfig 
          config={localConfig as Extract<ChartConfig, { chartType: 'line' }>} 
          onChange={(updates) => updateConfig(updates)} 
        />
      )}
      
      {chart.chartType === 'pie' && (
        <PieChartConfig 
          config={localConfig as Extract<ChartConfig, { chartType: 'pie' }>} 
          onChange={(updates) => updateConfig(updates)} 
        />
      )}
      
      {chart.chartType === 'scatter' && (
        <ScatterChartConfig 
          config={localConfig as Extract<ChartConfig, { chartType: 'scatter' }>} 
          onChange={(updates) => updateConfig(updates)} 
        />
      )}

      {chart.chartType === 'radar' && (
        <RadarChartConfig 
          config={localConfig as Extract<ChartConfig, { chartType: 'radar' }>} 
          onChange={(updates) => updateConfig(updates)} 
        />
      )}

      {chart.chartType === 'heatmap' && (
        <HeatmapChartConfig 
          config={localConfig as Extract<ChartConfig, { chartType: 'heatmap' }>} 
          onChange={(updates) => updateConfig(updates)} 
        />
      )}

      {chart.chartType === 'areaBump' && (
        <AreaBumpChartConfig 
          config={localConfig as Extract<ChartConfig, { chartType: 'areaBump' }>} 
          onChange={(updates) => updateConfig(updates)} 
        />
      )}
    </div>
  );
}

// Chart-specific configuration components
function BarChartConfig({ 
  config, 
  onChange 
}: { 
  config: Extract<ChartConfig, { chartType: 'bar' }>; 
  onChange: (updates: Partial<Extract<ChartConfig, { chartType: 'bar' }>>) => void;
}) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Bar Chart Configuration</h4>
      
      {/* Layout */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Layout</label>
          <select
            className="w-full mt-1 p-2 border rounded"
            value={config.layout || 'vertical'}
            onChange={(e) => onChange({ layout: e.target.value as 'vertical' | 'horizontal' })}
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Group Mode</label>
          <select
            className="w-full mt-1 p-2 border rounded"
            value={config.groupMode || 'grouped'}
            onChange={(e) => onChange({ groupMode: e.target.value as 'stacked' | 'grouped' })}
          >
            <option value="grouped">Grouped</option>
            <option value="stacked">Stacked</option>
          </select>
        </div>
      </div>

      {/* Padding */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Padding ({config.padding || 0.3})</label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={config.padding || 0.3}
            onChange={(e) => onChange({ padding: Number.parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Inner Padding ({config.innerPadding || 0})</label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={config.innerPadding || 0}
            onChange={(e) => onChange({ innerPadding: Number.parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Value Scale */}
      <div>
        <h5 className="font-medium mb-2">Value Scale</h5>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-sm">Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.valueScale?.type || 'linear'}
              onChange={(e) => onChange({ 
                valueScale: { ...config.valueScale, type: e.target.value as 'linear' | 'symlog' }
              })}
            >
              <option value="linear">Linear</option>
              <option value="symlog">Symlog</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Min</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value={config.valueScale?.min === 'auto' ? 'auto' : config.valueScale?.min || ''}
              onChange={(e) => onChange({ 
                valueScale: { 
                  type: config.valueScale?.type || 'linear',
                  ...config.valueScale, 
                  min: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
                }
              })}
            />
          </div>
          <div>
            <label className="text-sm">Max</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value={config.valueScale?.max === 'auto' ? 'auto' : config.valueScale?.max || ''}
              onChange={(e) => onChange({ 
                valueScale: { 
                  type: config.valueScale?.type || 'linear',
                  ...config.valueScale, 
                  max: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
                }
              })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.valueScale?.stacked || false}
              onChange={(e) => onChange({ 
                valueScale: { 
                  type: config.valueScale?.type || 'linear',
                  ...config.valueScale, 
                  stacked: e.target.checked 
                }
              })}
            />
            <label className="text-xs">Stacked</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.valueScale?.reverse || false}
              onChange={(e) => onChange({ 
                valueScale: { 
                  type: config.valueScale?.type || 'linear',
                  ...config.valueScale, 
                  reverse: e.target.checked 
                }
              })}
            />
            <label className="text-xs">Reverse</label>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div>
        <h5 className="font-medium mb-2">Labels</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableLabel || false}
              onChange={(e) => onChange({ enableLabel: e.target.checked })}
            />
            <label className="text-sm">Enable Labels</label>
          </div>
          <div>
            <label className="text-sm">Label Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.label || 'value'}
              onChange={(e) => onChange({ label: e.target.value as 'value' | 'formattedValue' | string })}
            >
              <option value="value">Value</option>
              <option value="formattedValue">Formatted Value</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div>
            <label className="text-xs">Skip Width</label>
            <input
              type="number"
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.labelSkipWidth || 0}
              onChange={(e) => onChange({ labelSkipWidth: Number.parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-xs">Skip Height</label>
            <input
              type="number"
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.labelSkipHeight || 0}
              onChange={(e) => onChange({ labelSkipHeight: Number.parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-xs">Text Color</label>
            <input
              type="color"
              className="w-full mt-1 p-1 border rounded"
              value={config.labelTextColor || '#000000'}
              onChange={(e) => onChange({ labelTextColor: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div>
        <h5 className="font-medium mb-2">Grid</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableGridX || false}
              onChange={(e) => onChange({ enableGridX: e.target.checked })}
            />
            <label className="text-sm">Enable Grid X</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableGridY || false}
              onChange={(e) => onChange({ enableGridY: e.target.checked })}
            />
            <label className="text-sm">Enable Grid Y</label>
          </div>
        </div>
      </div>

      {/* Axes Configuration */}
      <div>
        <h5 className="font-medium mb-2">Axes</h5>
        <div className="text-xs text-muted-foreground mb-2">Configure axis properties (simplified)</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisBottom}
              onChange={(e) => onChange({ 
                axisBottom: e.target.checked ? { legend: 'Bottom Axis' } : null 
              })}
            />
            <label className="text-xs">Bottom Axis</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisLeft}
              onChange={(e) => onChange({ 
                axisLeft: e.target.checked ? { legend: 'Left Axis' } : null 
              })}
            />
            <label className="text-xs">Left Axis</label>
          </div>
        </div>
      </div>
    </div>
  );
}

function LineChartConfig({ 
  config, 
  onChange 
}: { 
  config: Extract<ChartConfig, { chartType: 'line' }>; 
  onChange: (updates: Partial<Extract<ChartConfig, { chartType: 'line' }>>) => void;
}) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Line Chart Configuration</h4>
      
      {/* Curve and Line Properties */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Curve Type</label>
          <select
            className="w-full mt-1 p-2 border rounded"
            value={config.curve || 'linear'}
            onChange={(e) => onChange({ curve: e.target.value as any })}
          >
            <option value="basis">Basis</option>
            <option value="cardinal">Cardinal</option>
            <option value="catmullRom">Catmull Rom</option>
            <option value="linear">Linear</option>
            <option value="monotoneX">Monotone X</option>
            <option value="monotoneY">Monotone Y</option>
            <option value="natural">Natural</option>
            <option value="step">Step</option>
            <option value="stepAfter">Step After</option>
            <option value="stepBefore">Step Before</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Line Width ({config.lineWidth || 2})</label>
          <input
            type="range"
            min="1"
            max="10"
            value={config.lineWidth || 2}
            onChange={(e) => onChange({ lineWidth: Number.parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* X Scale */}
      <div>
        <h5 className="font-medium mb-2">X Scale</h5>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-sm">Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.xScale?.type || 'point'}
              onChange={(e) => onChange({ 
                xScale: { 
                  type: e.target.value as 'point' | 'linear' | 'time',
                  ...config.xScale 
                }
              })}
            >
              <option value="point">Point</option>
              <option value="linear">Linear</option>
              <option value="time">Time</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Min</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value="auto"
              disabled
            />
          </div>
          <div>
            <label className="text-sm">Max</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value="auto"
              disabled
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={false}
              disabled
            />
            <label className="text-xs">Stacked</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={false}
              disabled
            />
            <label className="text-xs">Reverse</label>
          </div>
        </div>
      </div>

      {/* Y Scale */}
      <div>
        <h5 className="font-medium mb-2">Y Scale</h5>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-sm">Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.yScale?.type || 'linear'}
              onChange={(e) => onChange({ 
                yScale: { 
                  type: e.target.value as 'linear' | 'symlog',
                  ...config.yScale 
                }
              })}
            >
              <option value="linear">Linear</option>
              <option value="symlog">Symlog</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Min</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value={config.yScale?.min === 'auto' ? 'auto' : config.yScale?.min || ''}
              onChange={(e) => onChange({ 
                yScale: { 
                  type: config.yScale?.type || 'linear',
                  ...config.yScale, 
                  min: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
                }
              })}
            />
          </div>
          <div>
            <label className="text-sm">Max</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value={config.yScale?.max === 'auto' ? 'auto' : config.yScale?.max || ''}
              onChange={(e) => onChange({ 
                yScale: { 
                  type: config.yScale?.type || 'linear',
                  ...config.yScale, 
                  max: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
                }
              })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.yScale?.stacked || false}
              onChange={(e) => onChange({ 
                yScale: { 
                  type: config.yScale?.type || 'linear',
                  ...config.yScale, 
                  stacked: e.target.checked 
                }
              })}
            />
            <label className="text-xs">Stacked</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.yScale?.reverse || false}
              onChange={(e) => onChange({ 
                yScale: { 
                  type: config.yScale?.type || 'linear',
                  ...config.yScale, 
                  reverse: e.target.checked 
                }
              })}
            />
            <label className="text-xs">Reverse</label>
          </div>
        </div>
      </div>

      {/* Points */}
      <div>
        <h5 className="font-medium mb-2">Points</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enablePoints || false}
              onChange={(e) => onChange({ enablePoints: e.target.checked })}
            />
            <label className="text-sm">Enable Points</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enablePointLabel || false}
              onChange={(e) => onChange({ enablePointLabel: e.target.checked })}
            />
            <label className="text-sm">Enable Point Labels</label>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div>
            <label className="text-xs">Size ({config.pointSize || 8})</label>
            <input
              type="range"
              min="4"
              max="20"
              value={config.pointSize || 8}
              onChange={(e) => onChange({ pointSize: Number.parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs">Color</label>
            <input
              type="color"
              className="w-full mt-1 p-1 border rounded"
              value={config.pointColor || '#ffffff'}
              onChange={(e) => onChange({ pointColor: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs">Border Width</label>
            <input
              type="number"
              min="0"
              max="10"
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.pointBorderWidth || 0}
              onChange={(e) => onChange({ pointBorderWidth: Number.parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-xs">Border Color</label>
            <input
              type="color"
              className="w-full mt-1 p-1 border rounded"
              value={config.pointBorderColor || '#000000'}
              onChange={(e) => onChange({ pointBorderColor: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="text-xs">Point Label</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.pointLabel || ''}
              onChange={(e) => onChange({ pointLabel: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs">Label Y Offset</label>
            <input
              type="number"
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.pointLabelYOffset || 0}
              onChange={(e) => onChange({ pointLabelYOffset: Number.parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Areas */}
      <div>
        <h5 className="font-medium mb-2">Area Fill</h5>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableArea || false}
              onChange={(e) => onChange({ enableArea: e.target.checked })}
            />
            <label className="text-sm">Enable Area</label>
          </div>
          <div>
            <label className="text-xs">Opacity ({config.areaOpacity || 0.2})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.areaOpacity || 0.2}
              onChange={(e) => onChange({ areaOpacity: Number.parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs">Baseline Value</label>
            <input
              type="number"
              className="w-full mt-1 p-1 border rounded text-xs"
              value={0}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Grid and Crosshair */}
      <div>
        <h5 className="font-medium mb-2">Grid & Crosshair</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableGridX || false}
              onChange={(e) => onChange({ enableGridX: e.target.checked })}
            />
            <label className="text-sm">Enable Grid X</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableGridY || false}
              onChange={(e) => onChange({ enableGridY: e.target.checked })}
            />
            <label className="text-sm">Enable Grid Y</label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableCrosshair || false}
              onChange={(e) => onChange({ enableCrosshair: e.target.checked })}
            />
            <label className="text-sm">Enable Crosshair</label>
          </div>
          <div>
            <label className="text-sm">Crosshair Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.crosshairType || 'cross'}
              onChange={(e) => onChange({ crosshairType: e.target.value as any })}
            >
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="top-left">Top Left</option>
              <option value="top">Top</option>
              <option value="top-right">Top Right</option>
              <option value="right">Right</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="x">X</option>
              <option value="y">Y</option>
              <option value="cross">Cross</option>
            </select>
          </div>
        </div>
      </div>

      {/* Axes */}
      <div>
        <h5 className="font-medium mb-2">Axes</h5>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisBottom}
              onChange={(e) => onChange({ 
                axisBottom: e.target.checked ? { legend: 'X Axis' } : null 
              })}
            />
            <label className="text-xs">Bottom Axis</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisLeft}
              onChange={(e) => onChange({ 
                axisLeft: e.target.checked ? { legend: 'Y Axis' } : null 
              })}
            />
            <label className="text-xs">Left Axis</label>
          </div>
        </div>
      </div>
    </div>
  );
}

function PieChartConfig({ 
  config, 
  onChange 
}: { 
  config: Extract<ChartConfig, { chartType: 'pie' }>; 
  onChange: (updates: Partial<Extract<ChartConfig, { chartType: 'pie' }>>) => void;
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">Pie Chart Options</h4>
      <div>
        <label className="text-sm">Inner Radius</label>
        <input
          type="range"
          min="0"
          max="0.9"
          step="0.1"
          value={config.innerRadius || 0.5}
          onChange={(e) => onChange({ innerRadius: Number.parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-muted-foreground">{config.innerRadius || 0.5}</div>
      </div>
    </div>
  );
}

function ScatterChartConfig({ 
  config, 
  onChange 
}: { 
  config: Extract<ChartConfig, { chartType: 'scatter' }>; 
  onChange: (updates: Partial<Extract<ChartConfig, { chartType: 'scatter' }>>) => void;
}) {
  const nodeSize = typeof config.nodeSize === 'number' ? config.nodeSize : 10;
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Scatter Plot Configuration</h4>
      
      {/* Node Configuration */}
      <div>
        <h5 className="font-medium mb-2">Node Properties</h5>
        <div>
          <label className="text-sm">Node Size ({nodeSize})</label>
          <input
            type="range"
            min="4"
            max="64"
            value={nodeSize}
            onChange={(e) => onChange({ nodeSize: Number.parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* X Scale */}
      <div>
        <h5 className="font-medium mb-2">X Scale</h5>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm">Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.xScale?.type || 'linear'}
              onChange={(e) => onChange({ 
                xScale: { 
                  type: e.target.value as 'linear' | 'log' | 'symlog' | 'time',
                  ...config.xScale 
                }
              })}
            >
              <option value="linear">Linear</option>
              <option value="log">Log</option>
              <option value="symlog">Symlog</option>
              <option value="time">Time</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Min</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value={config.xScale?.min === 'auto' ? 'auto' : config.xScale?.min || ''}
              onChange={(e) => onChange({ 
                xScale: { 
                  type: config.xScale?.type || 'linear',
                  ...config.xScale, 
                  min: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
                }
              })}
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="text-sm">Max</label>
          <input
            type="text"
            className="w-full mt-1 p-1 border rounded text-xs"
            placeholder="auto"
            value={config.xScale?.max === 'auto' ? 'auto' : config.xScale?.max || ''}
            onChange={(e) => onChange({ 
              xScale: { 
                type: config.xScale?.type || 'linear',
                ...config.xScale, 
                max: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
              }
            })}
          />
        </div>
      </div>

      {/* Y Scale */}
      <div>
        <h5 className="font-medium mb-2">Y Scale</h5>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm">Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.yScale?.type || 'linear'}
              onChange={(e) => onChange({ 
                yScale: { 
                  type: e.target.value as 'linear' | 'log' | 'symlog' | 'time',
                  ...config.yScale 
                }
              })}
            >
              <option value="linear">Linear</option>
              <option value="log">Log</option>
              <option value="symlog">Symlog</option>
              <option value="time">Time</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Min</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value={config.yScale?.min === 'auto' ? 'auto' : config.yScale?.min || ''}
              onChange={(e) => onChange({ 
                yScale: { 
                  type: config.yScale?.type || 'linear',
                  ...config.yScale, 
                  min: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
                }
              })}
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="text-sm">Max</label>
          <input
            type="text"
            className="w-full mt-1 p-1 border rounded text-xs"
            placeholder="auto"
            value={config.yScale?.max === 'auto' ? 'auto' : config.yScale?.max || ''}
            onChange={(e) => onChange({ 
              yScale: { 
                type: config.yScale?.type || 'linear',
                ...config.yScale, 
                max: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
              }
            })}
          />
        </div>
      </div>

      {/* Grid and Mesh */}
      <div>
        <h5 className="font-medium mb-2">Grid & Mesh</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableGridX || false}
              onChange={(e) => onChange({ enableGridX: e.target.checked })}
            />
            <label className="text-sm">Enable Grid X</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableGridY || false}
              onChange={(e) => onChange({ enableGridY: e.target.checked })}
            />
            <label className="text-sm">Enable Grid Y</label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.useMesh || false}
              onChange={(e) => onChange({ useMesh: e.target.checked })}
            />
            <label className="text-sm">Use Mesh</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.debugMesh || false}
              onChange={(e) => onChange({ debugMesh: e.target.checked })}
            />
            <label className="text-sm">Debug Mesh</label>
          </div>
        </div>
      </div>

      {/* Axes Configuration */}
      <div>
        <h5 className="font-medium mb-2">Axes</h5>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisTop}
              onChange={(e) => onChange({ 
                axisTop: e.target.checked ? { legend: 'Top Axis' } : null 
              })}
            />
            <label className="text-xs">Top Axis</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisRight}
              onChange={(e) => onChange({ 
                axisRight: e.target.checked ? { legend: 'Right Axis' } : null 
              })}
            />
            <label className="text-xs">Right Axis</label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisBottom}
              onChange={(e) => onChange({ 
                axisBottom: e.target.checked ? { legend: 'X Axis' } : null 
              })}
            />
            <label className="text-xs">Bottom Axis</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisLeft}
              onChange={(e) => onChange({ 
                axisLeft: e.target.checked ? { legend: 'Y Axis' } : null 
              })}
            />
            <label className="text-xs">Left Axis</label>
          </div>
        </div>
      </div>

      {/* Legends */}
      <div>
        <h5 className="font-medium mb-2">Legends</h5>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={!!(config.legends && config.legends.length > 0)}
            onChange={(e) => onChange({ 
              legends: e.target.checked ? [{
                anchor: 'bottom-right',
                direction: 'column',
                translateX: 100,
                translateY: 0,
                itemWidth: 100,
                itemHeight: 18,
                symbolSize: 12
              }] : []
            })}
          />
          <label className="text-sm">Enable Legends</label>
        </div>
      </div>
    </div>
  );
}

function RadarChartConfig({ 
  config, 
  onChange 
}: { 
  config: Extract<ChartConfig, { chartType: 'radar' }>; 
  onChange: (updates: Partial<Extract<ChartConfig, { chartType: 'radar' }>>) => void;
}) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Radar Chart Configuration</h4>
      
      {/* Basic Properties */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Max Value</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded"
            placeholder="auto"
            value={config.maxValue === 'auto' ? 'auto' : config.maxValue || ''}
            onChange={(e) => onChange({ 
              maxValue: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
            })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Curve Type</label>
          <select
            className="w-full mt-1 p-2 border rounded"
            value={config.curve || 'linearClosed'}
            onChange={(e) => onChange({ curve: e.target.value as any })}
          >
            <option value="linearClosed">Linear Closed</option>
            <option value="basisClosed">Basis Closed</option>
            <option value="cardinalClosed">Cardinal Closed</option>
            <option value="catmullRomClosed">Catmull Rom Closed</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div>
        <h5 className="font-medium mb-2">Grid</h5>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm">Grid Levels ({config.gridLevels || 5})</label>
            <input
              type="range"
              min="3"
              max="8"
              value={config.gridLevels || 5}
              onChange={(e) => onChange({ gridLevels: Number.parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm">Grid Shape</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.gridShape || 'circular'}
              onChange={(e) => onChange({ gridShape: e.target.value as 'circular' | 'linear' })}
            >
              <option value="circular">Circular</option>
              <option value="linear">Linear</option>
            </select>
          </div>
          <div>
            <label className="text-xs">Label Offset ({config.gridLabelOffset || 16})</label>
            <input
              type="range"
              min="6"
              max="60"
              value={config.gridLabelOffset || 16}
              onChange={(e) => onChange({ gridLabelOffset: Number.parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Dots */}
      <div>
        <h5 className="font-medium mb-2">Dots</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableDots || false}
              onChange={(e) => onChange({ enableDots: e.target.checked })}
            />
            <label className="text-sm">Enable Dots</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableDotLabel || false}
              onChange={(e) => onChange({ enableDotLabel: e.target.checked })}
            />
            <label className="text-sm">Enable Dot Labels</label>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div>
            <label className="text-xs">Size ({config.dotSize || 6})</label>
            <input
              type="range"
              min="4"
              max="32"
              value={config.dotSize || 6}
              onChange={(e) => onChange({ dotSize: Number.parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs">Color</label>
            <input
              type="color"
              className="w-full mt-1 p-1 border rounded"
              value={config.dotColor || '#ffffff'}
              onChange={(e) => onChange({ dotColor: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs">Border Width</label>
            <input
              type="range"
              min="0"
              max="10"
              value={config.dotBorderWidth || 0}
              onChange={(e) => onChange({ dotBorderWidth: Number.parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs">Border Color</label>
            <input
              type="color"
              className="w-full mt-1 p-1 border rounded"
              value={config.dotBorderColor || '#000000'}
              onChange={(e) => onChange({ dotBorderColor: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Fill and Blend */}
      <div>
        <h5 className="font-medium mb-2">Fill & Blend</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Fill Opacity ({config.fillOpacity || 0.25})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.fillOpacity || 0.25}
              onChange={(e) => onChange({ fillOpacity: Number.parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm">Blend Mode</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.blendMode || 'normal'}
              onChange={(e) => onChange({ blendMode: e.target.value as any })}
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="darken">Darken</option>
              <option value="lighten">Lighten</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeatmapChartConfig({ 
  config, 
  onChange 
}: { 
  config: Extract<ChartConfig, { chartType: 'heatmap' }>; 
  onChange: (updates: Partial<Extract<ChartConfig, { chartType: 'heatmap' }>>) => void;
}) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Heatmap Configuration</h4>
      
      {/* Basic Properties */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.forceSquare || false}
            onChange={(e) => onChange({ forceSquare: e.target.checked })}
          />
          <label className="text-sm">Force Square</label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.enableLabels || false}
            onChange={(e) => onChange({ enableLabels: e.target.checked })}
          />
          <label className="text-sm">Enable Labels</label>
        </div>
      </div>

      {/* Size and Opacity */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm">Size Variation (0)</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={0}
            disabled
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm">Cell Opacity ({config.cellOpacity || 1})</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.cellOpacity || 1}
            onChange={(e) => onChange({ cellOpacity: Number.parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm">Border Width ({config.cellBorderWidth || 0})</label>
          <input
            type="range"
            min="0"
            max="10"
            value={config.cellBorderWidth || 0}
            onChange={(e) => onChange({ cellBorderWidth: Number.parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Cell Styling */}
      <div>
        <h5 className="font-medium mb-2">Cell Styling</h5>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm">Cell Shape</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value="rect"
              disabled
            >
              <option value="rect">Rectangle</option>
              <option value="circle">Circle</option>
            </select>
          </div>
          <div>
            <label className="text-xs">Border Color</label>
            <input
              type="color"
              className="w-full mt-1 p-1 border rounded"
              value={config.cellBorderColor || '#000000'}
              onChange={(e) => onChange({ cellBorderColor: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs">Label Color</label>
            <input
              type="color"
              className="w-full mt-1 p-1 border rounded"
              value={config.labelTextColor || '#000000'}
              onChange={(e) => onChange({ labelTextColor: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Color Scale */}
      <div>
        <h5 className="font-medium mb-2">Color Scale</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Scale Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.colorScale?.type || 'quantize'}
              onChange={(e) => onChange({ 
                colorScale: { 
                  ...config.colorScale, 
                  type: e.target.value as 'quantize' | 'linear' | 'symlog'
                }
              })}
            >
              <option value="quantize">Quantize</option>
              <option value="linear">Linear</option>
              <option value="symlog">Symlog</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Color Scheme</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.colorScale?.scheme || 'blues'}
              onChange={(e) => onChange({ 
                colorScale: { 
                  type: config.colorScale?.type || 'quantize',
                  ...config.colorScale, 
                  scheme: e.target.value as any
                }
              })}
            >
              <option value="blues">Blues</option>
              <option value="greens">Greens</option>
              <option value="reds">Reds</option>
              <option value="oranges">Oranges</option>
              <option value="purples">Purples</option>
              <option value="viridis">Viridis</option>
              <option value="plasma">Plasma</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="text-xs">Min Value</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value={config.colorScale?.min === 'auto' ? 'auto' : config.colorScale?.min || ''}
              onChange={(e) => onChange({ 
                colorScale: { 
                  type: config.colorScale?.type || 'quantize',
                  ...config.colorScale, 
                  min: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
                }
              })}
            />
          </div>
          <div>
            <label className="text-xs">Max Value</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value={config.colorScale?.max === 'auto' ? 'auto' : config.colorScale?.max || ''}
              onChange={(e) => onChange({ 
                colorScale: { 
                  type: config.colorScale?.type || 'quantize',
                  ...config.colorScale, 
                  max: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
                }
              })}
            />
          </div>
        </div>
      </div>

      {/* Axes */}
      <div>
        <h5 className="font-medium mb-2">Axes</h5>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisBottom}
              onChange={(e) => onChange({ 
                axisBottom: e.target.checked ? { legend: 'X Axis' } : null 
              })}
            />
            <label className="text-xs">Bottom Axis</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisLeft}
              onChange={(e) => onChange({ 
                axisLeft: e.target.checked ? { legend: 'Y Axis' } : null 
              })}
            />
            <label className="text-xs">Left Axis</label>
          </div>
        </div>
      </div>
    </div>
  );
}

function AreaBumpChartConfig({ 
  config, 
  onChange 
}: { 
  config: Extract<ChartConfig, { chartType: 'areaBump' }>; 
  onChange: (updates: Partial<Extract<ChartConfig, { chartType: 'areaBump' }>>) => void;
}) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Area Bump Configuration</h4>
      
      {/* Basic Properties */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Alignment</label>
          <select
            className="w-full mt-1 p-2 border rounded"
            value={config.align || 'middle'}
            onChange={(e) => onChange({ align: e.target.value as 'start' | 'middle' | 'end' })}
          >
            <option value="start">Start</option>
            <option value="middle">Middle</option>
            <option value="end">End</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Interpolation</label>
          <select
            className="w-full mt-1 p-2 border rounded"
            value={config.interpolation || 'smooth'}
            onChange={(e) => onChange({ interpolation: e.target.value as 'smooth' | 'linear' })}
          >
            <option value="smooth">Smooth</option>
            <option value="linear">Linear</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Spacing ({config.spacing || 8})</label>
          <input
            type="range"
            min="0"
            max="32"
            value={config.spacing || 8}
            onChange={(e) => onChange({ spacing: Number.parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Padding */}
      <div>
        <h5 className="font-medium mb-2">Padding</h5>
        <div>
          <label className="text-sm">X Padding ({config.xPadding || 0.5})</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.xPadding || 0.5}
            onChange={(e) => onChange({ xPadding: Number.parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Start Labels */}
      <div>
        <h5 className="font-medium mb-2">Start Labels</h5>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.startLabel || false}
              onChange={(e) => onChange({ startLabel: e.target.checked })}
            />
            <label className="text-sm">Enable Start Labels</label>
          </div>
          <div>
            <label className="text-xs">Padding ({config.startLabelPadding || 16})</label>
            <input
              type="range"
              min="0"
              max="32"
              value={config.startLabelPadding || 16}
              onChange={(e) => onChange({ startLabelPadding: Number.parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs">Text Color</label>
            <input
              type="color"
              className="w-full mt-1 p-1 border rounded"
              value={config.startLabelTextColor || '#000000'}
              onChange={(e) => onChange({ startLabelTextColor: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* End Labels */}
      <div>
        <h5 className="font-medium mb-2">End Labels</h5>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.endLabel || false}
              onChange={(e) => onChange({ endLabel: e.target.checked })}
            />
            <label className="text-sm">Enable End Labels</label>
          </div>
          <div>
            <label className="text-xs">Padding ({config.endLabelPadding || 16})</label>
            <input
              type="range"
              min="0"
              max="32"
              value={config.endLabelPadding || 16}
              onChange={(e) => onChange({ endLabelPadding: Number.parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs">Text Color</label>
            <input
              type="color"
              className="w-full mt-1 p-1 border rounded"
              value={config.endLabelTextColor || '#000000'}
              onChange={(e) => onChange({ endLabelTextColor: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Axes */}
      <div>
        <h5 className="font-medium mb-2">Axes</h5>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisTop}
              onChange={(e) => onChange({ 
                axisTop: e.target.checked ? { legend: 'Top Axis' } : null 
              })}
            />
            <label className="text-xs">Top Axis</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisBottom}
              onChange={(e) => onChange({ 
                axisBottom: e.target.checked ? { legend: 'Bottom Axis' } : null 
              })}
            />
            <label className="text-xs">Bottom Axis</label>
          </div>
        </div>
      </div>
    </div>
  );
} 