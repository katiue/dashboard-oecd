import React, { useState, useEffect } from 'react';
import { NodeView, DataTable } from '../core';
import { DataCleaningNodeModel } from './node-model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NodeDataTable } from '@/components/ui/node-data-table';

export class DataCleaningNodeView extends NodeView<DataCleaningNodeModel> {
  private loadedData: DataTable | null = null;
  private cleaningStats: any = null;
  private forceUpdateCallback: (() => void) | null = null;

  createViewPanel(): React.ReactElement {
    return React.createElement(DataCleaningViewPanelWrapper, {
      nodeView: this,
      onRefresh: () => this.refreshData()
    });
  }

  onModelChanged(): void {
    // Handle model changes
    this.refreshData();
  }

  private refreshData(): void {
    // In a real implementation, this would get data from the model
    // For now, we'll create mock cleaning stats
    this.cleaningStats = {
      originalRows: 1000,
      finalRows: 850,
      operationsPerformed: [
        'Cleaned 150 cells',
        'Removed 50 empty rows',
        'Processed 100 duplicates',
        'Inferred and cast 200 values to appropriate types'
      ],
      cleaningStrategy: 'COMPREHENSIVE',
      duplicateStrategy: 'AGGREGATE',
      typeInference: 'SAFE'
    };
  }

  // Method to set the loaded data (called by execution engine)
  public setLoadedData(data: DataTable | null): void {
    this.loadedData = data;
    console.log('DataCleaningNodeView.setLoadedData called with:', data ? `${data.size} rows` : 'null');
    // Trigger re-render if callback is set
    if (this.forceUpdateCallback) {
      this.forceUpdateCallback();
    }
  }

  // Method to get the loaded data
  public getLoadedData(): DataTable | null {
    return this.loadedData;
  }

  // Method to set update callback
  public setUpdateCallback(callback: () => void): void {
    this.forceUpdateCallback = callback;
  }
}

interface DataCleaningViewPanelWrapperProps {
  nodeView: DataCleaningNodeView;
  onRefresh: () => void;
}

function DataCleaningViewPanelWrapper(props: DataCleaningViewPanelWrapperProps) {
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
  const cleaningStats = (props.nodeView as any).cleaningStats;

  return React.createElement(DataCleaningViewPanel, {
    loadedData,
    cleaningStats,
    onRefresh: props.onRefresh
  });
}

interface DataCleaningViewPanelProps {
  loadedData: DataTable | null;
  cleaningStats: any;
  onRefresh: () => void;
}

function DataCleaningViewPanel(props: DataCleaningViewPanelProps) {
  const { loadedData, cleaningStats } = props;

  if (!loadedData) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Data Cleaning Results</h3>
        <div className="p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            No data processed yet. Execute the workflow to see cleaning results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Data Cleaning Results</h3>
      
      {/* Cleaning Summary */}
      {cleaningStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cleaning Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Original Rows:</strong> {cleaningStats.originalRows?.toLocaleString() || 'N/A'}
              </div>
              <div>
                <strong>Final Rows:</strong> {cleaningStats.finalRows?.toLocaleString() || loadedData.size.toLocaleString()}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="text-sm font-medium mb-2">Operations Performed:</div>
              <div className="space-y-1">
                {cleaningStats.operationsPerformed?.map((operation: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {operation}
                  </Badge>
                )) || (
                  <Badge variant="outline" className="text-xs">
                    Data processed successfully
                  </Badge>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <strong>Strategy:</strong> {cleaningStats.cleaningStrategy || 'Standard'}
              </div>
              <div>
                <strong>Duplicates:</strong> {cleaningStats.duplicateStrategy || 'None'}
              </div>
              <div>
                <strong>Types:</strong> {cleaningStats.typeInference || 'Disabled'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cleaned Data Table */}
      <Card>
        <CardContent className="p-0">
          <NodeDataTable
            dataTable={loadedData}
            title="Cleaned Data"
            description={`Data after cleaning operations with ${loadedData.size} rows`}
            rowsPerPage={10}
            emptyMessage="No cleaned data found"
            noDataMessage="No data has been processed for cleaning"
          />
        </CardContent>
      </Card>
    </div>
  );
} 