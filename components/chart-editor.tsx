import React, { useEffect, useState, useRef, useCallback } from 'react';
import { parse } from 'papaparse';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { CopyIcon } from '@/components/icons';
import {
  ChartIcon,
} from '@/components/chart-icons';
import { toast } from 'sonner';
import ChartRenderer, { type ChartType } from '@/lib/chart/ChartRenderer';
import * as ChartDataProcessor from '@/lib/chart/ChartDataProcessor';
interface ChartEditorProps {
  content: string;
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  saveContent: (content: string, debounce: boolean) => void;
  status: 'streaming' | 'idle';
}

interface ChartVisualization {
  chartType: 'bar' | 'line' | 'pie' | 'heatmap' | 'radar' | 'scatter';
  title: string;
  description: string;
  data: any;
  config?: any; // Chart configuration object
}

export function ChartEditor({
  content,
  currentVersionIndex,
  isCurrentVersion,
  saveContent,
  status,
}: ChartEditorProps) {
  const [activeTab, setActiveTab] = useState<'charts' | 'data'>('charts');
  // ensure Tabs onValueChange works with string type
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'charts' | 'data');
  };
  const [chartConfigurations, setChartConfigurations] = useState<
    ChartVisualization[]
  >([]);
  const [csvData, setCsvData] = useState('');
  const [selectedChartType, setSelectedChartType] = useState<
    'bar' | 'line' | 'pie' | 'heatmap' | 'radar' | 'scatter'
  >('bar');

  const parseContent = useCallback((contentValue: string) => {
    try {
      if (!contentValue || contentValue.trim() === '') {
        return; // Skip processing empty content
      }
      
      // Check if content looks like JSON (starts with { and ends with })
      const trimmedContent = contentValue.trim();
      if (!trimmedContent.startsWith('{') || !trimmedContent.endsWith('}')) {
        console.log('Content does not appear to be JSON, treating as plain text/CSV data');
        // If it looks like CSV data (contains commas and lines), use it as CSV
        if (trimmedContent.includes(',') && trimmedContent.includes('\n')) {
          setCsvData(trimmedContent);
          setChartConfigurations([]);
        } else {
          // Otherwise, it might be natural language from the AI - ignore it
          console.log('Content appears to be natural language, ignoring...');
        }
        return;
      }
      
      const parsedContent = JSON.parse(contentValue);
      
      // Validate the parsed content has the expected structure
      if (typeof parsedContent !== 'object' || parsedContent === null) {
        console.log('Parsed content is not a valid object');
        return;
      }
      
      // Only use csvData and ignore randomData to prevent data replacement
      const dataFromContent = parsedContent.csvData || '';

      setCsvData(dataFromContent);

      if (Array.isArray(parsedContent.charts)) {
        setChartConfigurations(
          parsedContent.charts.map((chart: any) => ({
            chartType: chart.chartType || 'bar',
            title: chart.title || 'Untitled Chart',
            description: chart.description || '',
            config: chart.config, // Include the configuration
            // Preserve existing data from the chart content rather than regenerating
            data:
              chart.data ||
              (dataFromContent
                ? parseCSVToChartData(dataFromContent, chart.chartType)
                : []),
          })),
        );
      }
    } catch (e) {
      console.error('Error parsing chart content:', e);
      // If JSON parsing fails, check if it might be CSV data
      if (typeof contentValue === 'string') {
        const trimmedContent = contentValue.trim();
        // Only treat as CSV if it actually looks like CSV data
        if (trimmedContent.includes(',') && (trimmedContent.includes('\n') || trimmedContent.split(',').length > 1)) {
          console.log('Treating failed JSON parse as CSV data');
          setCsvData(trimmedContent);
          setChartConfigurations([]);
        } else {
          console.log('Content does not appear to be valid CSV or JSON, ignoring...');
          // Don't clear existing data if the content doesn't look useful
        }
      }
    }
  }, []);

  // Only process content if it's present and not already processed
  const prevContent = useRef('');
  useEffect(() => {
    // Check if content is different to avoid unnecessary processing
    if (content && content.trim() !== '' && content !== prevContent.current) {
      console.log('Processing chart content, length:', content.length);
      prevContent.current = content;
      parseContent(content);
    }
  }, [content, parseContent]);

  const handleDataChange = (newData: string) => {
    setCsvData(newData);

    const newContent = JSON.stringify(
      {
        csvData: newData,
        charts: chartConfigurations,
      },
      null,
      2,
    );

    saveContent(newContent, true);
  };
  const parseCSVToChartData = (csv: string, chartType: string) => {
    if (!csv || typeof csv !== 'string' || csv.trim() === '') {
      return [];
    }

    try {
      const parsed = parse(csv, { header: true });

      // Ensure data is properly extracted from parsing result
      if (
        !parsed ||
        !parsed.data ||
        !Array.isArray(parsed.data) ||
        parsed.data.length === 0
      ) {
        return [];
      }

      const data = parsed.data.filter(
        (item) => item !== null && typeof item === 'object',
      );
      const meta = parsed.meta || {};

      if (data.length === 0 || !data[0]) {
        return [];
      }

      // dynamic transform lookup
      const transformFnName = `process${chartType.charAt(0).toUpperCase() + chartType.slice(1)}ChartData`;
      const transformFn = (ChartDataProcessor as any)[transformFnName];

      if (typeof transformFn !== 'function') {
        console.warn(`Transform function ${transformFnName} not found`);
        return data;
      }

      const transformedData = transformFn(data, meta);
      console.log('transformedData', transformedData);
      return Array.isArray(transformedData) ? transformedData : [];
    } catch (error) {
      console.error('Error parsing CSV data:', error);
      return [];
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(csvData);
    toast.success('Copied data to clipboard');
  };

  // handle CSV file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      handleDataChange(text);
      toast.success('Loaded CSV file');
    };
    reader.readAsText(file);
  }; // generate and load random CSV data - disabled
  const handleGenerateRandom = () => {
    // Function disabled as requested
    console.log('Random data generation disabled');
  };

  // helper to reorder charts
  const moveChart = (fromIndex: number, direction: number) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= chartConfigurations.length) return;
    const newCharts = [...chartConfigurations];
    [newCharts[fromIndex], newCharts[toIndex]] = [
      newCharts[toIndex],
      newCharts[fromIndex],
    ];
    setChartConfigurations(newCharts);
    const newContent = JSON.stringify({ csvData, charts: newCharts }, null, 2);
    saveContent(newContent, false);
  };

  if (status === 'streaming') {
    return <DocumentSkeleton artifactKind="chart" />;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {' '}
        <TabsList className="mb-4">
          <TabsTrigger value="charts">
            Charts ({chartConfigurations.length})
          </TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>
        <TabsContent value="charts" className="h-full">
          {isCurrentVersion && chartConfigurations.length > 0 && (
            <div className="mb-4 flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  const newChartTitle = `New ${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Chart`;
                  const newChart = {
                    chartType: selectedChartType,
                    title: newChartTitle,
                    description: `Auto-generated ${selectedChartType} chart from CSV data`,
                    data: parseCSVToChartData(csvData, selectedChartType),
                  };

                  const updatedCharts = [newChart, ...chartConfigurations]; // new chart first
                  setChartConfigurations(updatedCharts);

                  const newContent = JSON.stringify(
                    {
                      csvData,
                      charts: updatedCharts,
                    },
                    null,
                    2,
                  );

                  saveContent(newContent, false);
                  toast.success(`Added new ${selectedChartType} chart`);
                }}
              >
                <ChartIcon className="mr-2" size={16} />
                Add Chart
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chartConfigurations.map((visualization, index) => (
              <Card
                key={`chart-${index}-${visualization.chartType}-${visualization.title}`}
                className="overflow-hidden"
              >
                {' '}
                <div className="p-4 border-b flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">
                      {visualization.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {visualization.description}
                    </p>
                  </div>
                  {isCurrentVersion && (
                    <div className="flex space-x-1">
                      <Button size="icon" onClick={() => moveChart(index, -1)}>
                        ↑
                      </Button>
                      <Button size="icon" onClick={() => moveChart(index, 1)}>
                        ↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const updatedCharts = chartConfigurations.filter(
                            (chart) => chart !== visualization,
                          );
                          setChartConfigurations(updatedCharts);

                          const newContent = JSON.stringify(
                            {
                              csvData,
                              charts: updatedCharts,
                            },
                            null,
                            2,
                          );

                          saveContent(newContent, false);
                          toast.success('Removed chart');
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>{' '}
                <CardContent className="p-4">
                  <div style={{ height: 400 }}>
                    {visualization.data &&
                    Array.isArray(visualization.data) &&
                    visualization.data.length > 0 ? (
                      <ChartRenderer
                        chartType={visualization.chartType as ChartType}
                        data={visualization.data}
                        config={visualization.config}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <p className="text-muted-foreground">
                          No valid data for this chart
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {chartConfigurations.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-10 text-center">
                <h3 className="text-lg font-medium mb-2">
                  No Charts Available
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {csvData 
                    ? "No chart configurations found. Add CSV data first, then the AI agent can generate charts for you."
                    : "This chart document needs data to create visualizations. Switch to the Data tab to add CSV data, or ask the AI to create charts with sample data."
                  }
                </p>
                {csvData && isCurrentVersion && (
                  <Button
                    className="mt-4"
                    onClick={() => {
                      const newChartTitle = `New ${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Chart`;
                      const newChart = {
                        chartType: selectedChartType,
                        title: newChartTitle,
                        description: `Auto-generated ${selectedChartType} chart from CSV data`,
                        data: parseCSVToChartData(csvData, selectedChartType),
                      };

                      const updatedCharts = [newChart, ...chartConfigurations]; // new chart first
                      setChartConfigurations(updatedCharts);

                      const newContent = JSON.stringify(
                        {
                          csvData,
                          charts: updatedCharts,
                        },
                        null,
                        2,
                      );

                      saveContent(newContent, false);
                      toast.success(`Created new ${selectedChartType} chart`);
                    }}
                  >
                    <ChartIcon className="mr-2" size={16} />
                    Create{' '}
                    {selectedChartType.charAt(0).toUpperCase() +
                      selectedChartType.slice(1)}{' '}
                    Chart
                  </Button>
                )}
                {!csvData && !isCurrentVersion && (
                  <div className="text-xs text-gray-400 mt-2">
                    💡 Tip: Ask the AI &quot;Create a chart with sample sales data&quot; or &quot;Generate a chart document with sample data&quot; to get started
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="data" className="h-full">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">CSV Data</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 px-2"
              >
                <span className="mr-1">
                  <CopyIcon size={16} />
                </span>
                Copy
              </Button>
            </div>
            <Textarea
              value={csvData}
              onChange={(e) => handleDataChange(e.target.value)}
              className="font-mono flex-1 h-full min-h-[300px] resize-none"
              placeholder="Enter CSV data here..."
              disabled={!isCurrentVersion || currentVersionIndex !== -1}
            />{' '}
            <div className="flex justify-end items-center mt-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                id="upload-csv"
                className="hidden"
              />
              <label htmlFor="upload-csv">
                <Button variant="outline" size="sm" asChild>
                  Upload CSV File
                </Button>
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
