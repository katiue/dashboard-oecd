import React, { useState, useEffect } from 'react';
import { NodeView, type DataTable } from '../core';
import type { RowFilterNodeModel, } from './node-model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export class RowFilterNodeView extends NodeView<RowFilterNodeModel> {
  private loadedData: DataTable | null = null;
  private filterStats: any = null;
  private forceUpdateCallback: (() => void) | null = null;

  createViewPanel(): React.ReactElement {
    return React.createElement(RowFilterViewPanelWrapper, {
      nodeView: this,
      onRefresh: () => this.refreshData()
    });
  }

  onModelChanged(): void {
    this.refreshData();
    this.forceUpdateCallback?.();
  }

  private refreshData(): void {
    // Generate filter statistics
    if (this.loadedData) {
      const filters = this.nodeModel.getFilters();
      const logic = this.nodeModel.getLogic();
      
      this.filterStats = {
        totalFilters: filters.length,
        logic: logic,
        filterDescriptions: filters.map(f => `${f.column} ${f.operator} ${Array.isArray(f.value) ? f.value.join(', ') : f.value}`)
      };
    }
    
    this.forceUpdateCallback?.();
  }

  public setLoadedData(data: DataTable | null): void {
    this.loadedData = data;
    this.refreshData();
  }

  public getLoadedData(): DataTable | null {
    return this.loadedData;
  }

  public setUpdateCallback(callback: () => void): void {
    this.forceUpdateCallback = callback;
  }
}

interface RowFilterViewPanelWrapperProps {
  nodeView: RowFilterNodeView;
  onRefresh: () => void;
}

function RowFilterViewPanelWrapper(props: RowFilterViewPanelWrapperProps) {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const updateCallback = () => forceUpdate({});
    props.nodeView.setUpdateCallback(updateCallback);
    
    return () => {
      props.nodeView.setUpdateCallback(() => {});
    };
  }, [props.nodeView]);

  return React.createElement(RowFilterViewPanel, {
    loadedData: props.nodeView.getLoadedData(),
    filterStats: (props.nodeView as any).filterStats,
    onRefresh: props.onRefresh
  });
}

interface RowFilterViewPanelProps {
  loadedData: DataTable | null;
  filterStats: any;
  onRefresh: () => void;
}

function RowFilterViewPanel(props: RowFilterViewPanelProps) {
  if (!props.loadedData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No filtered data available</p>
              <p className="text-sm">Execute the node to see filtered results</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = props.loadedData;
  const stats = props.filterStats;

  // Convert data table to preview format
  const headers = data.spec.columns.map(col => col.name);
  const previewRows: any[][] = [];
  
  let rowCount = 0;
  data.forEach(row => {
    if (rowCount < 10) { // Show first 10 rows
      const rowData = headers.map((_, index) => {
        return row.cells[index]?.getValue() || '';
      });
      previewRows.push(rowData);
      rowCount++;
    }
  });

  return (
    <div className="p-6 space-y-6">
      {/* Filter Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Filtered Rows</p>
              <p className="text-2xl font-bold">{data.size.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Columns</p>
              <p className="text-2xl font-bold">{headers.length}</p>
            </div>
          </div>

          {stats && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Applied Filters</p>
                {stats.totalFilters === 0 ? (
                  <Badge variant="secondary">No filters applied</Badge>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge>{stats.totalFilters} filter{stats.totalFilters !== 1 ? 's' : ''}</Badge>
                      <Badge variant="outline">{stats.logic} logic</Badge>
                    </div>
                    <div className="space-y-1">
                      {stats.filterDescriptions.map((desc: string, index: number) => (
                        <p key={index} className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                          {desc}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {headers.map((header, index) => (
                    <th key={index} className="text-left p-2 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length} className="text-center p-4 text-muted-foreground">
                      No data rows match the filter criteria
                    </td>
                  </tr>
                ) : (
                  previewRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b hover:bg-muted/50">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="p-2">
                          <div className="max-w-[200px] truncate" title={String(cell)}>
                            {String(cell)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {data.size > 10 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing first 10 of {data.size.toLocaleString()} rows
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 