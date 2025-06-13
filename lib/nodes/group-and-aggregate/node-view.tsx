import React, { useState, useEffect } from 'react';
import { NodeView, type DataTable } from '../core';
import { type GroupAndAggregateNodeModel, AggregationMethod } from './node-model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LoaderIcon, ChartBarIcon, LineChartIcon, PieChartIcon } from '@/components/icons';
import { UnifiedChartRenderer, type ChartConfig, type ChartType } from '@/lib/chart/UnifiedChartRenderer';
import { NodeDataTable } from '@/components/ui/node-data-table';

/**
 * View for visualizing GroupAndAggregate node results
 */
export class GroupAndAggregateNodeView extends NodeView<GroupAndAggregateNodeModel> {
  private outputTable: DataTable | null = null;
  private data: any[] = [];
  private isLoading = true;
  private error: string | null = null;
  private groupColumns: string[] = [];
  private aggregations: any[] = [];
  private forceUpdateCallback: (() => void) | null = null;

  /**
   * Fetches the current state from the node model
   */
  private async fetchData() {
    try {
      const outputTable = await this.getOutputTable();
      const settings = await this.getNodeSettings();
      
      if (outputTable && settings) {
        this.outputTable = outputTable;
        this.data = this.convertTableToViewData(outputTable);
        this.groupColumns = settings.groupColumns || [];
        this.aggregations = settings.aggregations || [];
        this.isLoading = false;
        this.error = null;
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error';
      this.isLoading = false;
    }
    
    // Trigger re-render if callback is set
    if (this.forceUpdateCallback) {
      this.forceUpdateCallback();
    }
  }

  /**
   * Gets the output table from the node model
   */
  private async getOutputTable(): Promise<DataTable | null> {
    // In a real implementation, this would be provided by the framework
    const rows = Array(20).fill(0).map((_, i) => ({
      key: `row_${i}`,
      cells: [
        { getValue: () => `Group ${i % 5}`, type: 'string' },
        { getValue: () => i % 5 * 100 + 50, type: 'number' },
        { getValue: () => i % 5 * 10 + 5, type: 'number' },
        { getValue: () => i % 5 * 2, type: 'number' }
      ],
      getCell: (index: number) => {
        const cells = [
          { getValue: () => `Group ${i % 5}`, type: 'string' },
          { getValue: () => i % 5 * 100 + 50, type: 'number' },
          { getValue: () => i % 5 * 10 + 5, type: 'number' },
          { getValue: () => i % 5 * 2, type: 'number' }
        ];
        return cells[index];
      }
    }));

    return {
      rows,
      size: rows.length,
      forEach: (callback: (row: any) => void) => {
        rows.forEach(callback);
      },
      spec: {
        columns: [
          { name: 'group_col', type: 'string' },
          { name: 'value_sum', type: 'number' },
          { name: 'value_avg', type: 'number' },
          { name: 'value_count', type: 'number' }
        ],
        findColumnIndex: (name: string) => {
          const columns = [
            { name: 'group_col', type: 'string' },
            { name: 'value_sum', type: 'number' },
            { name: 'value_avg', type: 'number' },
            { name: 'value_count', type: 'number' }
          ];
          return columns.findIndex(col => col.name === name);
        }
      }
    };
  }

  /**
   * Gets the node settings
   */
  private async getNodeSettings() {
    return {
      groupColumns: ['group_col'],
      aggregations: [
        { columnName: 'value', method: AggregationMethod.SUM, newColumnName: 'value_sum' },
        { columnName: 'value', method: AggregationMethod.AVERAGE, newColumnName: 'value_avg' },
        { columnName: 'value', method: AggregationMethod.COUNT, newColumnName: 'value_count' }
      ]
    };
  }

  /**
   * Converts the output table to a format suitable for the view
   */
  private convertTableToViewData(table: any) {
    return table.rows.map((row: any) => {
      const result: Record<string, any> = {};
      table.spec.columns.forEach((col: any, i: number) => {
        result[col.name] = row.cells[i].getValue();
      });
      return result;
    });
  }

  /**
   * Called when the underlying model has changed
   */
  onModelChanged(): void {
    this.fetchData();
  }

  // Method to set the loaded data (called by execution engine)
  public setLoadedData(data: DataTable | null): void {
    this.outputTable = data;
    if (data) {
      this.data = this.convertTableToViewData(data);
      this.isLoading = false;
      this.error = null;
    }
    console.log('GroupAndAggregateNodeView.setLoadedData called with:', data ? `${data.size} rows` : 'null');
    // Trigger re-render if callback is set
    if (this.forceUpdateCallback) {
      this.forceUpdateCallback();
    }
  }

  // Method to get the loaded data
  public getLoadedData(): DataTable | null {
    return this.outputTable;
  }

  // Method to set update callback
  public setUpdateCallback(callback: () => void): void {
    this.forceUpdateCallback = callback;
  }

  /**
   * Creates the React component for the view UI
   */
  createViewPanel(): React.ReactElement {
    return React.createElement(GroupAndAggregateViewPanelWrapper, {
      nodeView: this,
      onRefresh: () => this.fetchData()
    });
  }
}

interface GroupAndAggregateViewPanelWrapperProps {
  nodeView: GroupAndAggregateNodeView;
  onRefresh: () => void;
}

function GroupAndAggregateViewPanelWrapper(props: GroupAndAggregateViewPanelWrapperProps) {
  const [, forceUpdate] = useState({});
  
  // Set up the force update callback
  useEffect(() => {
    const updateCallback = () => forceUpdate({});
    props.nodeView.setUpdateCallback(updateCallback);
    
    return () => {
      props.nodeView.setUpdateCallback(() => {});
    };
  }, [props.nodeView]);

  const loadedData = props.nodeView.getLoadedData();

  return React.createElement(GroupAndAggregateViewPanel, {
    outputTable: loadedData,
    data: (props.nodeView as any).data || [],
    isLoading: (props.nodeView as any).isLoading || false,
    error: (props.nodeView as any).error || null,
    groupColumns: (props.nodeView as any).groupColumns || [],
    aggregations: (props.nodeView as any).aggregations || [],
    onRefresh: props.onRefresh
  });
}

/**
 * React component for the view UI
 */
interface GroupAndAggregateViewPanelProps {
  outputTable: DataTable | null;
  data: any[];
  isLoading: boolean;
  error: string | null;
  groupColumns: string[];
  aggregations: any[];
  onRefresh: () => void;
}

function GroupAndAggregateViewPanel(props: GroupAndAggregateViewPanelProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('bar');
  
  const { outputTable } = props;

  // Set default selected metric when data or aggregations change
  useEffect(() => {
    if (props.aggregations.length > 0 && !selectedMetric) {
      // Find first numeric aggregation
      const numericAgg = props.aggregations.find(agg => 
        [AggregationMethod.SUM, AggregationMethod.AVERAGE, AggregationMethod.MIN, AggregationMethod.MAX].includes(agg.method)
      );
      
      if (numericAgg) {
        setSelectedMetric(numericAgg.newColumnName);
      } else if (props.aggregations[0]) {
        setSelectedMetric(props.aggregations[0].newColumnName);
      }
    }
  }, [props.aggregations, selectedMetric]);

  // Get numeric columns for charts
  const numericColumns = props.data.length > 0 
    ? Object.keys(props.data[0]).filter(key => 
        typeof props.data[0][key] === 'number'
      )
    : [];

  // Prepare chart data
  const chartData = props.data.slice(0, 20);  // Limit to first 20 for performance
  if (props.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin">
          <LoaderIcon size={24} />
        </div>
      </div>
    );
  }

  if (props.error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500 font-semibold mb-2">Error Loading Data</div>
          <div className="text-sm text-muted-foreground mb-4">{props.error}</div>
          <Button onClick={props.onRefresh}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  // Create chart config for the unified chart renderer
  const chartConfig: ChartConfig = {
    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'],
    margin: { top: 20, right: 30, left: 20, bottom: 60 },
    dataMapping: {
      indexBy: props.groupColumns[0] || 'group',
      valueColumns: [selectedMetric || 'value']
    }
  } as any;

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Aggregation Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Group By Columns:</div>
            <div className="flex flex-wrap gap-2">
              {props.groupColumns.map(col => (
                <Badge key={col} variant="secondary">{col}</Badge>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <div className="text-sm font-medium mb-2">Aggregations:</div>
            <div className="flex flex-wrap gap-2">
              {props.aggregations.map(agg => (
                <Badge 
                  key={agg.newColumnName} 
                  variant="outline"
                >
                  {agg.columnName} ({agg.method})
                </Badge>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="text-sm">
            <strong>Total Groups:</strong> {props.data.length}
          </div>
        </CardContent>
      </Card>

      {/* Data and Visualization Tabs */}
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Data Table</TabsTrigger>
          <TabsTrigger value="chart" disabled={numericColumns.length === 0}>
            Visualization
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <NodeDataTable
                dataTable={outputTable}
                title="Aggregated Results"
                description={`Grouped and aggregated data with ${props.data.length} result rows`}
                rowsPerPage={10}
                emptyMessage="No aggregation results found"
                noDataMessage="No data has been processed for aggregation"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chart" className="space-y-4">
          <Card>            
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Select Metric to Visualize:</div>
                <div className="flex flex-wrap gap-2">
                  {numericColumns.map(col => (
                    <Badge 
                      key={col}
                      variant={selectedMetric === col ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedMetric(col)}
                    >
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Chart Type:</div>
                <div className="flex gap-2">
                  <Badge 
                    variant={chartType === 'bar' ? "default" : "outline"}
                    className="cursor-pointer flex items-center gap-1"
                    onClick={() => setChartType('bar')}
                  >
                    <ChartBarIcon size={12} />
                    Bar
                  </Badge>
                  <Badge 
                    variant={chartType === 'line' ? "default" : "outline"}
                    className="cursor-pointer flex items-center gap-1"
                    onClick={() => setChartType('line')}
                  >
                    <LineChartIcon size={12} />
                    Line
                  </Badge>
                  <Badge 
                    variant={chartType === 'pie' ? "default" : "outline"}
                    className="cursor-pointer flex items-center gap-1"
                    onClick={() => setChartType('pie')}
                  >
                    <PieChartIcon size={12} />
                    Pie
                  </Badge>
                </div>
              </div>              {selectedMetric && (
                <div className="h-96 w-full">
                  <UnifiedChartRenderer
                    chartType={chartType}
                    data={chartData}
                    config={chartConfig}
                  />
                </div>
              )}
              
              {props.data.length > 20 && (
                <div className="text-center text-xs text-muted-foreground">
                  Chart shows first 20 groups for better visualization
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}