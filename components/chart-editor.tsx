import React, { useEffect, useState, useRef } from 'react';
import { parse } from 'papaparse';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { CopyIcon } from '@/components/icons';
import {
  BarChartIcon,
  LineChartIcon,
  PieChartIcon,
  RadarChartIcon,
  HeatMapChartIcon,
  ScatterChartIcon,
  ChartIcon,
} from '@/components/chart-icons';
import { toast } from 'sonner';
import ChartRenderer, { type ChartType } from '@/lib/chart/ChartRenderer';
import * as ChartTransforms from '@/lib/chart/ChartTransforms';

interface ChartEditorProps {
  content: string;
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  saveContent: (content: string, debounce: boolean) => void;
  status: 'streaming' | 'idle';
}

interface ChartConfig {
  chartType: 'bar' | 'line' | 'pie' | 'heatmap' | 'radar' | 'scatter';
  title: string;
  description: string;
  dataSchema: string;
  randomData: string;
}

interface ChartVisualization {
  chartType: 'bar' | 'line' | 'pie' | 'heatmap' | 'radar' | 'scatter';
  title: string;
  description: string;
  data: any;
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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<
    'bar' | 'line' | 'pie' | 'heatmap' | 'radar' | 'scatter'
  >('bar');
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

  // generate random CSV data when needed
  const generateRandomCSV = () => {
    const headers = ['label', 'value'];
    const rows = Array.from(
      { length: 5 },
      (_, i) =>
        `${String.fromCharCode(65 + i)},${Math.floor(Math.random() * 100)}`,
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const parseContent = (contentValue: string) => {
    try {
      const parsedContent = JSON.parse(contentValue);
      const { csvData, randomData, charts } = parsedContent;

      setCsvData(csvData || randomData || '');

      if (Array.isArray(charts)) {
        setChartConfigurations(
          charts.map((chart) => ({
            chartType: chart.chartType,
            title: chart.title,
            description: chart.description,
            data: chart.data || parseCSVToChartData(csvData, chart.chartType),
          })),
        );
      }
    } catch (e) {
      // If JSON parsing fails, assume it's CSV data only
      setCsvData(contentValue);
      setChartConfigurations([]);
    }
  };
  // Completely reset chart state when content changes or component initially renders
  useEffect(() => {
    // Reset chart state
    setChartConfigurations([]);
    setCsvData('');

    if (content) {
      parseContent(content);
    }
  }, [content, isCurrentVersion]);

  // On initial mount without existing content, generate random data and create an initial chart
  useEffect(() => {
    if (!content && isCurrentVersion) {
      handleGenerateRandom();
    }
  }, []);

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
    try {
      const parsed = parse(csv, { header: true });
      const { data, meta } = parsed;

      if (!data || data.length === 0 || !data[0]) return [];

      // dynamic transform lookup
      const transformFn = (ChartTransforms as any)[
        `transformFor${chartType.charAt(0).toUpperCase() + chartType.slice(1)}Chart`
      ];
      return typeof transformFn === 'function' ? transformFn(data, meta) : data;
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
  };

  // generate and load random CSV data
  const handleGenerateRandom = () => {
    const randomCSV = generateRandomCSV();
    handleDataChange(randomCSV);
    toast.success('Generated random CSV data');
    // auto-create a chart from random data
    const newChart = {
      chartType: selectedChartType,
      title: `Random ${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Chart`,
      description: `Auto-generated ${selectedChartType} chart from random CSV data`,
      data: parseCSVToChartData(randomCSV, selectedChartType),
    };
    const updatedCharts = [newChart, ...chartConfigurations];
    setChartConfigurations(updatedCharts);
    const newContent = JSON.stringify(
      { csvData: randomCSV, charts: updatedCharts },
      null,
      2,
    );
    saveContent(newContent, false);
    toast.success(`Added new ${selectedChartType} chart`);
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
                </div>
                <CardContent className="p-4">
                  <div style={{ height: 400 }}>
                    <ChartRenderer
                      chartType={visualization.chartType as ChartType}
                      data={visualization.data}
                      theme={defaultChartTheme}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {chartConfigurations.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-10 text-center">
                <h3 className="text-lg font-medium mb-2">
                  No Charts Available
                </h3>
                <p className="text-sm text-gray-500">
                  No chart configurations found. Add CSV data first, then the AI
                  agent can generate charts for you.
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
            />
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateRandom}
              >
                Generate Random Data
              </Button>
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
