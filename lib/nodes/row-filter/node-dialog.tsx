import React, { useState, useEffect } from 'react';
import { NodeDialog, type SettingsObject, type DataTableSpec } from '../core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type FilterCondition, FilterLogic } from './node-model';
import { Trash2, Plus } from 'lucide-react';

export class RowFilterNodeDialog extends NodeDialog {
  private static FILTERS_KEY = 'filters';
  private static LOGIC_KEY = 'logic';

  private filters: FilterCondition[] = [];
  private logic: FilterLogic = FilterLogic.AND;

  createDialogPanel(settings: SettingsObject, specs: DataTableSpec[]): React.ReactElement {
    this.loadSettings(settings, specs);
    
    return React.createElement(RowFilterDialogPanel, {
      settings,
      specs,
      initialValues: {
        filters: this.filters,
        logic: this.logic
      },
      onSettingsChange: (values) => {
        this.filters = values.filters;
        this.logic = values.logic;
      }
    });
  }

  loadSettings(settings: SettingsObject, specs: DataTableSpec[]): void {
    const filtersData = settings.getString?.(RowFilterNodeDialog.FILTERS_KEY, '[]') || '[]';
    try {
      this.filters = JSON.parse(filtersData) || [];
    } catch {
      this.filters = [];
    }
    
    this.logic = (settings.getString?.(RowFilterNodeDialog.LOGIC_KEY, FilterLogic.AND) || FilterLogic.AND) as FilterLogic;
  }

  saveSettings(settings: SettingsObject): void {
    settings.set?.(RowFilterNodeDialog.FILTERS_KEY, JSON.stringify(this.filters));
    settings.set?.(RowFilterNodeDialog.LOGIC_KEY, this.logic);
  }
}

interface RowFilterDialogPanelProps {
  settings: SettingsObject;
  specs: DataTableSpec[];
  initialValues: {
    filters: FilterCondition[];
    logic: FilterLogic;
  };
  onSettingsChange: (values: any) => void;
}

function RowFilterDialogPanel(props: RowFilterDialogPanelProps) {
  const [filters, setFilters] = useState<FilterCondition[]>(props.initialValues.filters);
  const [logic, setLogic] = useState<FilterLogic>(props.initialValues.logic);

  // Get available columns from input specs
  const availableColumns = props.specs[0]?.columns.map(col => col.name) || [];

  // Notify parent of changes
  useEffect(() => {
    props.onSettingsChange({
      filters,
      logic
    });
  }, [filters, logic, props]);

  const addFilter = () => {
    const newFilter: FilterCondition = {
      column: availableColumns[0] || '',
      operator: '==',
      value: '',
      caseSensitive: false
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<FilterCondition>) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], ...updates };
    setFilters(updatedFilters);
  };

  const operatorLabels = {
    '==': 'Equals',
    '!=': 'Not Equals', 
    '>': 'Greater Than',
    '<': 'Less Than',
    '>=': 'Greater or Equal',
    '<=': 'Less or Equal',
    'contains': 'Contains',
    'startsWith': 'Starts With',
    'endsWith': 'Ends With',
    'in': 'In List',
    'between': 'Between'
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Row Filter Configuration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Filter rows based on column values. For example, filter Species column to show only &quot;panda&quot; rows.
        </p>
      </div>

      {/* Filter Logic */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Logic</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="filter-logic">Logic</Label>
            <Select value={logic} onValueChange={(value) => setLogic(value as FilterLogic)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FilterLogic.AND}>AND - All conditions must be true</SelectItem>
                <SelectItem value={FilterLogic.OR}>OR - Any condition can be true</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Filter Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Filter Conditions
            <Button
              variant="outline"
              size="sm"
              onClick={addFilter}
              disabled={availableColumns.length === 0}
            >
              <Plus className="size-4 mr-1" />
              Add Filter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No filters configured. All rows will pass through.
            </p>
          ) : (
            <div className="space-y-4">
              {filters.map((filter, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Filter {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Column */}
                    <div>
                      <Label>Column</Label>
                      <Select 
                        value={filter.column} 
                        onValueChange={(value) => updateFilter(index, { column: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableColumns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operator */}
                    <div>
                      <Label>Operator</Label>
                      <Select 
                        value={filter.operator} 
                        onValueChange={(value) => updateFilter(index, { operator: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(operatorLabels).map(([op, label]) => (
                            <SelectItem key={op} value={op}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value */}
                    <div>
                      <Label>Value</Label>
                      {filter.operator === 'in' ? (
                        <Input
                          value={Array.isArray(filter.value) ? filter.value.join(', ') : String(filter.value)}
                          onChange={(e) => {
                            const values = e.target.value.split(',').map(v => v.trim());
                            updateFilter(index, { value: values });
                          }}
                          placeholder="val1, val2, val3"
                        />
                      ) : filter.operator === 'between' ? (
                        <Input
                          value={Array.isArray(filter.value) ? filter.value.join(' - ') : String(filter.value)}
                          onChange={(e) => {
                            const values = e.target.value.split('-').map(v => {
                              const trimmed = v.trim();
                              const num = Number(trimmed);
                              return Number.isNaN(num) ? trimmed : num;
                            });
                            updateFilter(index, { value: values });
                          }}
                          placeholder="min - max"
                        />
                      ) : (
                        <Input
                          value={String(filter.value)}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = Number(val);
                            updateFilter(index, { value: Number.isNaN(num) ? val : num });
                          }}
                          placeholder="Enter value"
                        />
                      )}
                    </div>
                  </div>

                  {/* Case Sensitive */}
                  {['==', '!=', 'contains', 'startsWith', 'endsWith', 'in'].includes(filter.operator) && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`case-sensitive-${index}`}
                        checked={filter.caseSensitive}
                        onCheckedChange={(checked) => updateFilter(index, { caseSensitive: checked })}
                      />
                      <Label htmlFor={`case-sensitive-${index}`}>Case Sensitive</Label>
                    </div>
                  )}

                  {/* Example */}
                  <div className="text-xs text-muted-foreground">
                    Example: {filter.column || 'Column'} {filter.operator} {
                      Array.isArray(filter.value) ? filter.value.join(', ') : filter.value || 'Value'
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {availableColumns.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            No input columns available. Connect a data source to configure filters.
          </p>
        </div>
      )}
    </div>
  );
} 