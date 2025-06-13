import React, { useState, useEffect } from 'react';
import { NodeDialog, SettingsObject, DataTableSpec } from '../core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CleaningStrategy, DuplicateStrategy, TypeInferenceMode } from './node-model';

export class DataCleaningNodeDialog extends NodeDialog {
  private static CLEANING_STRATEGY_KEY = 'cleaning_strategy';
  private static DUPLICATE_STRATEGY_KEY = 'duplicate_strategy';
  private static DUPLICATE_COLUMN_KEY = 'duplicate_column';
  private static TYPE_INFERENCE_KEY = 'type_inference';
  private static TRIM_WHITESPACE_KEY = 'trim_whitespace';
  private static NORMALIZE_TEXT_KEY = 'normalize_text';
  private static STANDARDIZE_NULLS_KEY = 'standardize_nulls';
  private static REMOVE_EMPTY_ROWS_KEY = 'remove_empty_rows';

  private cleaningStrategy: CleaningStrategy = CleaningStrategy.BASIC;
  private duplicateStrategy: DuplicateStrategy = DuplicateStrategy.SKIP;
  private duplicateColumn: string = '';
  private typeInference: TypeInferenceMode = TypeInferenceMode.SAFE;
  private trimWhitespace: boolean = true;
  private normalizeText: boolean = true;
  private standardizeNulls: boolean = true;
  private removeEmptyRows: boolean = true;

  createDialogPanel(settings: SettingsObject, specs: DataTableSpec[]): React.ReactElement {
    this.loadSettings(settings, specs);
    
    return React.createElement(DataCleaningDialogPanel, {
      settings,
      specs,
      initialValues: {
        cleaningStrategy: this.cleaningStrategy,
        duplicateStrategy: this.duplicateStrategy,
        duplicateColumn: this.duplicateColumn,
        typeInference: this.typeInference,
        trimWhitespace: this.trimWhitespace,
        normalizeText: this.normalizeText,
        standardizeNulls: this.standardizeNulls,
        removeEmptyRows: this.removeEmptyRows
      },
      onSettingsChange: (values) => {
        this.cleaningStrategy = values.cleaningStrategy;
        this.duplicateStrategy = values.duplicateStrategy;
        this.duplicateColumn = values.duplicateColumn;
        this.typeInference = values.typeInference;
        this.trimWhitespace = values.trimWhitespace;
        this.normalizeText = values.normalizeText;
        this.standardizeNulls = values.standardizeNulls;
        this.removeEmptyRows = values.removeEmptyRows;
      }
    });
  }

  loadSettings(settings: SettingsObject, specs: DataTableSpec[]): void {
    this.cleaningStrategy = (settings.getString?.(DataCleaningNodeDialog.CLEANING_STRATEGY_KEY, CleaningStrategy.BASIC) || CleaningStrategy.BASIC) as CleaningStrategy;
    this.duplicateStrategy = (settings.getString?.(DataCleaningNodeDialog.DUPLICATE_STRATEGY_KEY, DuplicateStrategy.SKIP) || DuplicateStrategy.SKIP) as DuplicateStrategy;
    this.duplicateColumn = settings.getString?.(DataCleaningNodeDialog.DUPLICATE_COLUMN_KEY, '') || '';
    this.typeInference = (settings.getString?.(DataCleaningNodeDialog.TYPE_INFERENCE_KEY, TypeInferenceMode.SAFE) || TypeInferenceMode.SAFE) as TypeInferenceMode;
    this.trimWhitespace = settings.getBoolean?.(DataCleaningNodeDialog.TRIM_WHITESPACE_KEY, true) ?? true;
    this.normalizeText = settings.getBoolean?.(DataCleaningNodeDialog.NORMALIZE_TEXT_KEY, true) ?? true;
    this.standardizeNulls = settings.getBoolean?.(DataCleaningNodeDialog.STANDARDIZE_NULLS_KEY, true) ?? true;
    this.removeEmptyRows = settings.getBoolean?.(DataCleaningNodeDialog.REMOVE_EMPTY_ROWS_KEY, true) ?? true;
  }

  saveSettings(settings: SettingsObject): void {
    settings.set?.(DataCleaningNodeDialog.CLEANING_STRATEGY_KEY, this.cleaningStrategy);
    settings.set?.(DataCleaningNodeDialog.DUPLICATE_STRATEGY_KEY, this.duplicateStrategy);
    settings.set?.(DataCleaningNodeDialog.DUPLICATE_COLUMN_KEY, this.duplicateColumn);
    settings.set?.(DataCleaningNodeDialog.TYPE_INFERENCE_KEY, this.typeInference);
    settings.set?.(DataCleaningNodeDialog.TRIM_WHITESPACE_KEY, this.trimWhitespace);
    settings.set?.(DataCleaningNodeDialog.NORMALIZE_TEXT_KEY, this.normalizeText);
    settings.set?.(DataCleaningNodeDialog.STANDARDIZE_NULLS_KEY, this.standardizeNulls);
    settings.set?.(DataCleaningNodeDialog.REMOVE_EMPTY_ROWS_KEY, this.removeEmptyRows);
  }
}

interface DataCleaningDialogPanelProps {
  settings: SettingsObject;
  specs: DataTableSpec[];
  initialValues: {
    cleaningStrategy: CleaningStrategy;
    duplicateStrategy: DuplicateStrategy;
    duplicateColumn: string;
    typeInference: TypeInferenceMode;
    trimWhitespace: boolean;
    normalizeText: boolean;
    standardizeNulls: boolean;
    removeEmptyRows: boolean;
  };
  onSettingsChange: (values: any) => void;
}

function DataCleaningDialogPanel(props: DataCleaningDialogPanelProps) {
  const [cleaningStrategy, setCleaningStrategy] = useState(props.initialValues.cleaningStrategy);
  const [duplicateStrategy, setDuplicateStrategy] = useState(props.initialValues.duplicateStrategy);
  const [duplicateColumn, setDuplicateColumn] = useState(props.initialValues.duplicateColumn);
  const [typeInference, setTypeInference] = useState(props.initialValues.typeInference);
  const [trimWhitespace, setTrimWhitespace] = useState(props.initialValues.trimWhitespace);
  const [normalizeText, setNormalizeText] = useState(props.initialValues.normalizeText);
  const [standardizeNulls, setStandardizeNulls] = useState(props.initialValues.standardizeNulls);
  const [removeEmptyRows, setRemoveEmptyRows] = useState(props.initialValues.removeEmptyRows);

  // Get available columns from input specs
  const availableColumns = props.specs[0]?.columns.map(col => col.name) || [];

  // Notify parent of changes
  useEffect(() => {
    props.onSettingsChange({
      cleaningStrategy,
      duplicateStrategy,
      duplicateColumn,
      typeInference,
      trimWhitespace,
      normalizeText,
      standardizeNulls,
      removeEmptyRows
    });
  }, [cleaningStrategy, duplicateStrategy, duplicateColumn, typeInference, trimWhitespace, normalizeText, standardizeNulls, removeEmptyRows, props]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Data Cleaning Configuration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure comprehensive data cleaning including duplicate handling, type inference, and cell value normalization.
        </p>
      </div>

      {/* Cleaning Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Cleaning Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cleaning-strategy">Strategy</Label>
            <Select value={cleaningStrategy} onValueChange={(value) => setCleaningStrategy(value as CleaningStrategy)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CleaningStrategy.BASIC}>Basic - Standard cleaning operations</SelectItem>
                <SelectItem value={CleaningStrategy.COMPREHENSIVE}>Comprehensive - All cleaning features</SelectItem>
                <SelectItem value={CleaningStrategy.CUSTOM}>Custom - Manual configuration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(cleaningStrategy === CleaningStrategy.CUSTOM || cleaningStrategy === CleaningStrategy.COMPREHENSIVE) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="trim-whitespace"
                  checked={trimWhitespace}
                  onCheckedChange={setTrimWhitespace}
                />
                <Label htmlFor="trim-whitespace">Trim Whitespace</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="normalize-text"
                  checked={normalizeText}
                  onCheckedChange={setNormalizeText}
                />
                <Label htmlFor="normalize-text">Normalize Text</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="standardize-nulls"
                  checked={standardizeNulls}
                  onCheckedChange={setStandardizeNulls}
                />
                <Label htmlFor="standardize-nulls">Standardize Nulls</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-empty-rows"
                  checked={removeEmptyRows}
                  onCheckedChange={setRemoveEmptyRows}
                />
                <Label htmlFor="remove-empty-rows">Remove Empty Rows</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duplicate Handling */}
      <Card>
        <CardHeader>
          <CardTitle>Duplicate Handling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="duplicate-strategy">Strategy</Label>
            <Select value={duplicateStrategy} onValueChange={(value) => setDuplicateStrategy(value as DuplicateStrategy)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DuplicateStrategy.SKIP}>Skip - No duplicate processing</SelectItem>
                <SelectItem value={DuplicateStrategy.REMOVE}>Remove - Keep only first occurrence</SelectItem>
                <SelectItem value={DuplicateStrategy.AGGREGATE}>Aggregate - Sum numeric values</SelectItem>
                <SelectItem value={DuplicateStrategy.RENAME}>Rename - Add unique suffixes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {duplicateStrategy !== DuplicateStrategy.SKIP && (
            <div>
              <Label htmlFor="duplicate-column">Identifier Column</Label>
              <Select value={duplicateColumn} onValueChange={setDuplicateColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column to check for duplicates" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Column used to identify duplicate rows
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Type Inference */}
      <Card>
        <CardHeader>
          <CardTitle>Type Inference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="type-inference">Mode</Label>
            <Select value={typeInference} onValueChange={(value) => setTypeInference(value as TypeInferenceMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TypeInferenceMode.DISABLED}>Disabled - Keep original types</SelectItem>
                <SelectItem value={TypeInferenceMode.SAFE}>Safe - High confidence casting (80%+)</SelectItem>
                <SelectItem value={TypeInferenceMode.AGGRESSIVE}>Aggressive - Lower confidence casting (60%+)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically detect and convert data types (string, number, date, boolean)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 