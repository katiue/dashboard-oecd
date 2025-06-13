import React, { useState, useEffect } from 'react';
import { NodeView, type DataTable } from '../core';
import type { PythonScriptNodeModel } from './node-model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeDataTable } from '@/components/ui/node-data-table';

export class PythonScriptNodeView extends NodeView<PythonScriptNodeModel> {
  private loadedData: DataTable[] = [];
  private executionInfo: any = null;
  private forceUpdateCallback: (() => void) | null = null;

  createViewPanel(): React.ReactElement {
    return React.createElement(PythonScriptViewPanelWrapper, {
      nodeView: this,
      onRefresh: () => this.refreshData()
    });
  }

  onModelChanged(): void {
    // Handle model changes
    this.refreshData();
  }

  private refreshData(): void {
    // Get script configuration from the model
    this.executionInfo = {
      scriptLength: this.nodeModel.getScriptCode().length,
      inputPorts: this.nodeModel.getInputPorts(),
      outputPorts: this.nodeModel.getOutputPorts(),
      libraries: this.nodeModel.getLibraries(),
      lastExecution: null
    };
  }

  // Method to set the loaded data (called by execution engine)
  public setLoadedData(data: DataTable[] | DataTable | null): void {
    if (Array.isArray(data)) {
      this.loadedData = data;
    } else if (data) {
      this.loadedData = [data];
    } else {
      this.loadedData = [];
    }
    
    console.log('PythonScriptNodeView.setLoadedData called with:', this.loadedData.length, 'tables');
    
    // Update execution info
    if (this.loadedData.length > 0) {
      this.executionInfo = {
        ...this.executionInfo,
        lastExecution: {
          timestamp: new Date().toISOString(),
          outputCount: this.loadedData.length,
          totalRows: this.loadedData.reduce((sum, table) => sum + table.size, 0)
        }
      };
    }
    
    // Trigger re-render if callback is set
    if (this.forceUpdateCallback) {
      this.forceUpdateCallback();
    }
  }

  // Method to get the loaded data
  public getLoadedData(): DataTable[] {
    return this.loadedData;
  }

  // Method to set update callback
  public setUpdateCallback(callback: () => void): void {
    this.forceUpdateCallback = callback;
  }
}

interface PythonScriptViewPanelWrapperProps {
  nodeView: PythonScriptNodeView;
  onRefresh: () => void;
}

function PythonScriptViewPanelWrapper(props: PythonScriptViewPanelWrapperProps) {
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
  const executionInfo = (props.nodeView as any).executionInfo;

  return React.createElement(PythonScriptViewPanel, {
    loadedData,
    executionInfo,
    onRefresh: props.onRefresh
  });
}

interface PythonScriptViewPanelProps {
  loadedData: DataTable[];
  executionInfo: any;
  onRefresh: () => void;
}

function PythonScriptViewPanel(props: PythonScriptViewPanelProps) {
  const { loadedData, executionInfo } = props;

  if (!executionInfo) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Python Script Results</h3>
        <div className="p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            Configure the Python script to see execution details.
          </p>
        </div>
      </div>
    );
  }

  const hasResults = loadedData && loadedData.length > 0;

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Python Script Results</h3>
      
      {/* Script Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Script Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Script Size:</strong> {executionInfo.scriptLength || 0} characters
            </div>
            <div>
              <strong>Input Ports:</strong> {executionInfo.inputPorts?.length || 0}
            </div>
            <div>
              <strong>Output Ports:</strong> {executionInfo.outputPorts?.length || 0}
            </div>
            <div>
              <strong>Libraries:</strong> {executionInfo.libraries?.length || 0}
            </div>
          </div>
          
          {executionInfo.libraries && executionInfo.libraries.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2">Required Libraries:</div>
                <div className="flex flex-wrap gap-1">
                  {executionInfo.libraries.map((lib: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {lib}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {executionInfo.lastExecution && (
            <>
              <Separator />
              <div className="text-xs text-muted-foreground">
                <div><strong>Last Execution:</strong> {new Date(executionInfo.lastExecution.timestamp).toLocaleString()}</div>
                <div><strong>Output Tables:</strong> {executionInfo.lastExecution.outputCount}</div>
                <div><strong>Total Rows:</strong> {executionInfo.lastExecution.totalRows.toLocaleString()}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Execution Results */}
      {!hasResults ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No execution results yet.</p>
              <p className="text-xs mt-1">Execute the workflow to see Python script output.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="output-0" className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${loadedData.length}, 1fr)` }}>
            {loadedData.map((_, index) => (
              <TabsTrigger key={index} value={`output-${index}`}>
                Output {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {loadedData.map((table, index) => (
            <TabsContent key={index} value={`output-${index}`} className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <NodeDataTable
                    dataTable={table}
                    title={`Python Script Output ${index + 1}`}
                    description={`Data generated by Python script with ${table.size} rows`}
                    rowsPerPage={10}
                    emptyMessage="No data in this output"
                    noDataMessage="Python script produced no data for this output"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Port Configuration */}
      {(executionInfo.inputPorts?.length > 0 || executionInfo.outputPorts?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Port Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {executionInfo.inputPorts?.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Input Ports:</div>
                <div className="space-y-1">
                  {executionInfo.inputPorts.map((port: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="border-blue-500 text-blue-700">
                        {port.name}
                      </Badge>
                      <span className="text-muted-foreground">
                        {port.type} • {port.dataType} {port.required && '• required'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {executionInfo.outputPorts?.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Output Ports:</div>
                <div className="space-y-1">
                  {executionInfo.outputPorts.map((port: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="border-green-500 text-green-700">
                        {port.name}
                      </Badge>
                      <span className="text-muted-foreground">
                        {port.type} • {port.dataType} {port.required && '• required'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 