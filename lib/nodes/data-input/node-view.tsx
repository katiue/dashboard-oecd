import React, { useState, useEffect } from 'react';
import { NodeView, type DataTable } from '../core';
import type { DataInputNodeModel } from './node-model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NodeDataTable } from '@/components/ui/node-data-table';

export class DataInputNodeView extends NodeView<DataInputNodeModel> {
  private loadedData: DataTable | null = null;
  private forceUpdateCallback: (() => void) | null = null;

  createViewPanel(): React.ReactElement {
    // Get the configured URL from the node model using the proper getter
    const csvUrl = this.nodeModel.getCsvUrl();
    
    return React.createElement(DataInputViewPanelWrapper, {
      csvUrl,
      nodeView: this,
      onRefresh: () => this.refreshData()
    });
  }

  onModelChanged(): void {
    // Handle model changes - try to get the loaded data
    this.refreshData();
  }

  private refreshData(): void {
    // In a real implementation, we would get the loaded data from the model
    // For now, we'll create mock data if URL is configured
    if (this.nodeModel.getCsvUrl()) {
      // This would normally come from the execution results
      this.loadedData = null; // Will be set by the execution engine
    } else {
      this.loadedData = null;
    }
  }

  // Method to set the loaded data (called by execution engine)
  public setLoadedData(data: DataTable | null): void {
    this.loadedData = data;
    console.log('DataInputNodeView.setLoadedData called with:', data ? `${data.size} rows` : 'null');
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

interface DataInputViewPanelWrapperProps {
  csvUrl: string;
  nodeView: DataInputNodeView;
  onRefresh: () => void;
}

function DataInputViewPanelWrapper(props: DataInputViewPanelWrapperProps) {
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

  return React.createElement(DataInputViewPanel, {
    csvUrl: props.csvUrl,
    loadedData,
    onRefresh: props.onRefresh
  });
}

interface DataInputViewPanelProps {
  csvUrl: string;
  loadedData: DataTable | null;
  onRefresh: () => void;
}

function DataInputViewPanel(props: DataInputViewPanelProps) {
  const { csvUrl, loadedData } = props;

  if (!csvUrl) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Data Input</h3>
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            No CSV URL configured. Click the configure button to set a data source.
          </p>
        </div>
      </div>
    );
  }

  if (!loadedData) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Data Input Results</h3>
        <div className="p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            No data loaded yet. Execute the workflow to load data from the CSV source.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Data Input Results</h3>
      
      {/* Data source info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Data Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs text-muted-foreground break-all">
            {csvUrl}
          </div>
        </CardContent>
      </Card>

      {/* Data table using the new NodeDataTable component */}
      <Card>
        <CardContent className="p-0">
          <NodeDataTable
            dataTable={loadedData}
            title="Loaded Data"
            description={`Data loaded from CSV source`}
            rowsPerPage={10}
            emptyMessage="No data rows found"
            noDataMessage="No data has been loaded from the CSV source"
          />
        </CardContent>
      </Card>
    </div>
  );
} 