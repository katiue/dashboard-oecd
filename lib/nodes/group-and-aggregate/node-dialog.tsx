import { NodeDialog, SettingsObject, DataTableSpec } from '../core';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusIcon, TrashIcon } from '@/components/icons';
import { AggregationMethod } from './node-model';

/**
 * Dialog for the Group and Aggregate Node
 */
export class GroupAndAggregateNodeDialog extends NodeDialog {
  // Settings keys
  private static GROUP_COLUMNS_KEY = 'group_columns';
  private static AGGREGATIONS_KEY = 'aggregations';
  
  // Current settings values
  private groupColumns: string[] = [];
  private aggregations: Array<{
    columnName: string;
    method: AggregationMethod;
    newColumnName: string;
  }> = [];

  /**
   * Creates the React component for the dialog UI
   */
  createDialogPanel(
    settings: SettingsObject,
    specs: DataTableSpec[]
  ): React.ReactElement {
    return <GroupAndAggregateDialogPanel 
      settings={settings}
      specs={specs}
      initialGroupColumns={this.groupColumns}
      initialAggregations={this.aggregations}
      onSettingsChange={(groupCols, aggs) => {
        this.groupColumns = groupCols;
        this.aggregations = aggs;
      }}
    />;
  }

  /**
   * Load settings from the settings object
   */
  loadSettings(settings: SettingsObject, _specs: DataTableSpec[]): void {
    this.groupColumns = JSON.parse(settings.getString(
      GroupAndAggregateNodeDialog.GROUP_COLUMNS_KEY, 
      '[]'
    ));
    
    this.aggregations = JSON.parse(settings.getString(
      GroupAndAggregateNodeDialog.AGGREGATIONS_KEY, 
      '[]'
    ));
  }

  /**
   * Save settings to the settings object
   */
  saveSettings(settings: SettingsObject): void {
    settings.set(
      GroupAndAggregateNodeDialog.GROUP_COLUMNS_KEY, 
      JSON.stringify(this.groupColumns)
    );
    
    settings.set(
      GroupAndAggregateNodeDialog.AGGREGATIONS_KEY, 
      JSON.stringify(this.aggregations)
    );
  }
}

/**
 * React component for the dialog UI
 */
interface GroupAndAggregateDialogPanelProps {
  settings: SettingsObject;
  specs: DataTableSpec[];
  initialGroupColumns: string[];
  initialAggregations: Array<{
    columnName: string;
    method: AggregationMethod;
    newColumnName: string;
  }>;
  onSettingsChange: (
    groupColumns: string[], 
    aggregations: Array<{
      columnName: string;
      method: AggregationMethod;
      newColumnName: string;
    }>
  ) => void;
}

function GroupAndAggregateDialogPanel(props: GroupAndAggregateDialogPanelProps) {
  const [groupColumns, setGroupColumns] = useState<string[]>(props.initialGroupColumns);
  const [aggregations, setAggregations] = useState(props.initialAggregations);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  
  // Get all columns from specs
  const allColumns = props.specs[0]?.columns.map(col => col.name) || [];
  
  // Get remaining columns (not used for grouping)
  const remainingColumns = allColumns.filter(col => !groupColumns.includes(col));
  
  // Notify parent of changes
  useEffect(() => {
    props.onSettingsChange(groupColumns, aggregations);
  }, [groupColumns, aggregations, props]);
  
  // Add column to group by
  const addGroupColumn = () => {
    if (selectedColumn && !groupColumns.includes(selectedColumn)) {
      setGroupColumns([...groupColumns, selectedColumn]);
      setSelectedColumn('');
    }
  };
  
  // Remove column from group by
  const removeGroupColumn = (column: string) => {
    setGroupColumns(groupColumns.filter(col => col !== column));
  };
  
  // Add aggregation
  const addAggregation = () => {
    if (remainingColumns.length > 0) {
      const defaultColumn = remainingColumns[0];
      setAggregations([
        ...aggregations, 
        {
          columnName: defaultColumn,
          method: AggregationMethod.SUM,
          newColumnName: `${defaultColumn}_sum`
        }
      ]);
    }
  };
  
  // Remove aggregation
  const removeAggregation = (index: number) => {
    setAggregations(aggregations.filter((_, i) => i !== index));
  };
  
  // Update aggregation
  const updateAggregation = (index: number, field: string, value: any) => {
    const updatedAggregations = [...aggregations];
    
    // @ts-ignore - we know the field exists
    updatedAggregations[index][field] = value;
    
    // Auto-update the new column name when column or method changes
    if (field === 'columnName' || field === 'method') {
      const agg = updatedAggregations[index];
      const method = field === 'method' ? value : agg.method;
      const column = field === 'columnName' ? value : agg.columnName;
      const methodLower = method.toLowerCase();
      
      updatedAggregations[index].newColumnName = `${column}_${methodLower}`;
    }
    
    setAggregations(updatedAggregations);
  };
  
  return (
    <div className="space-y-6 p-6">
      {/* Group By Section */}
      <Card>
        <CardHeader>
          <CardTitle>Group By Columns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="column-select">Select Column</Label>
              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a column" />
                </SelectTrigger>
                <SelectContent>
                  {allColumns
                    .filter(col => !groupColumns.includes(col))
                    .map(col => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addGroupColumn}
                disabled={!selectedColumn}
                className="flex items-center gap-2"
              >
                <PlusIcon size={16} />
                Add
              </Button>
            </div>
          </div>
          
          <div>
            {groupColumns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No group columns selected. Select at least one column to group by.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {groupColumns.map(col => (
                  <Badge 
                    key={col} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeGroupColumn(col)}
                  >
                    {col} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Aggregations Section */}
      <Card>
        <CardHeader>
          <CardTitle>Aggregations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={addAggregation}
            disabled={remainingColumns.length === 0}
            className="flex items-center gap-2"
          >
            <PlusIcon size={16} />
            Add Aggregation
          </Button>
          
          {aggregations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No aggregations defined. Add at least one aggregation.
            </p>
          ) : (
            <div className="space-y-4">
              {aggregations.map((agg, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <Label>Column</Label>
                        <Select
                          value={agg.columnName}
                          onValueChange={(value) => updateAggregation(index, 'columnName', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allColumns
                              .filter(col => !groupColumns.includes(col) || col === agg.columnName)
                              .map(col => (
                                <SelectItem key={col} value={col}>
                                  {col}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Method</Label>
                        <Select
                          value={agg.method}
                          onValueChange={(value) => updateAggregation(index, 'method', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(AggregationMethod).map(method => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Output Column Name</Label>
                        <Input
                          value={agg.newColumnName}
                          onChange={(e) => updateAggregation(index, 'newColumnName', e.target.value)}
                        />
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAggregation(index)}
                        className="flex items-center gap-2"
                      >
                        <TrashIcon size={16} />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}