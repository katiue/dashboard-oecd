import { NodeModel, type DataTable, type DataTableSpec, type ExecutionContext, type SettingsObject, type Cell } from '../core';

// Simple Cell implementation
class SimpleCell implements Cell {
  constructor(private value: any, public readonly type: string) {}
  
  getValue(): any {
    return this.value;
  }
}

export enum CleaningStrategy {
  BASIC = 'BASIC',
  COMPREHENSIVE = 'COMPREHENSIVE',
  CUSTOM = 'CUSTOM'
}

export enum DuplicateStrategy {
  SKIP = 'SKIP',
  REMOVE = 'REMOVE',
  AGGREGATE = 'AGGREGATE',
  RENAME = 'RENAME'
}

export enum TypeInferenceMode {
  DISABLED = 'DISABLED',
  SAFE = 'SAFE',
  AGGRESSIVE = 'AGGRESSIVE'
}

export class DataCleaningNodeModel extends NodeModel {
  private static CLEANING_STRATEGY_KEY = 'cleaning_strategy';
  private static DUPLICATE_STRATEGY_KEY = 'duplicate_strategy';
  private static DUPLICATE_COLUMN_KEY = 'duplicate_column';
  private static TYPE_INFERENCE_KEY = 'type_inference';
  private static TRIM_WHITESPACE_KEY = 'trim_whitespace';
  private static NORMALIZE_TEXT_KEY = 'normalize_text';
  private static STANDARDIZE_NULLS_KEY = 'standardize_nulls';
  private static REMOVE_EMPTY_ROWS_KEY = 'remove_empty_rows';

  // Settings
  private cleaningStrategy: CleaningStrategy = CleaningStrategy.BASIC;
  private duplicateStrategy: DuplicateStrategy = DuplicateStrategy.SKIP;
  private duplicateColumn = '';
  private typeInference: TypeInferenceMode = TypeInferenceMode.SAFE;
  private trimWhitespace = true;
  private normalizeText = true;
  private standardizeNulls = true;
  private removeEmptyRows = true;

  constructor() {
    super(1, 1); // 1 input, 1 output
  }

  async execute(inData: DataTable[], context: ExecutionContext): Promise<DataTable[]> {
    const inputTable = inData[0];
    if (!inputTable || inputTable.size === 0) {
      throw new Error('No input data provided for cleaning');
    }

    context.setProgress(0.1, 'Starting data cleaning...');
    
    let cleanedData = this.convertTableToRows(inputTable);
    const headers = inputTable.spec.columns.map(col => col.name);
    const operations: string[] = [`Started with ${cleanedData.length} rows`];

    // Step 1: Basic cleaning
    if (this.cleaningStrategy !== CleaningStrategy.CUSTOM || this.trimWhitespace || this.normalizeText || this.standardizeNulls) {
      context.setProgress(0.2, 'Cleaning cell values...');
      const result = this.cleanCellValues(cleanedData, headers);
      cleanedData = result.data;
      operations.push(result.operation);
    }

    // Step 2: Remove empty rows
    if (this.removeEmptyRows) {
      context.setProgress(0.3, 'Removing empty rows...');
      const beforeCount = cleanedData.length;
      cleanedData = cleanedData.filter(row => 
        headers.some(h => row[h] !== null && row[h] !== undefined && String(row[h]).trim() !== '')
      );
      if (beforeCount !== cleanedData.length) {
        operations.push(`Removed ${beforeCount - cleanedData.length} empty rows`);
      }
    }

    // Step 3: Handle duplicates
    if (this.duplicateStrategy !== DuplicateStrategy.SKIP && this.duplicateColumn) {
      context.setProgress(0.5, 'Processing duplicates...');
      const result = this.handleDuplicates(cleanedData, headers, this.duplicateColumn);
      cleanedData = result.data;
      operations.push(result.operation);
    }

    // Step 4: Type inference and casting
    if (this.typeInference !== TypeInferenceMode.DISABLED) {
      context.setProgress(0.7, 'Inferring and casting types...');
      const result = this.inferAndCastTypes(cleanedData, headers);
      cleanedData = result.data;
      operations.push(result.operation);
    }

    context.setProgress(0.9, 'Creating output table...');

    // Create output table
    const outputSpec = this.createOutputSpec(inputTable.spec);
    const output = context.createDataTable(outputSpec);

    cleanedData.forEach((row, index) => {
      const cells = headers.map(header => {
        const value = row[header];
        const originalCol = inputTable.spec.columns.find(col => col.name === header);
        const type = originalCol?.type || 'string';
        return new SimpleCell(value, type);
      });
      output.addRow(`cleaned-row-${index}`, cells);
    });

    context.setProgress(1.0, `Completed cleaning: ${operations.join('; ')}`);
    return [output.close()];
  }

  private convertTableToRows(table: DataTable): Record<string, any>[] {
    const rows: Record<string, any>[] = [];
    table.forEach(row => {
      const rowData: Record<string, any> = {};
      table.spec.columns.forEach((col, index) => {
        rowData[col.name] = row.cells[index].getValue();
      });
      rows.push(rowData);
    });
    return rows;
  }

  private cleanCellValues(data: Record<string, any>[], headers: string[]): { data: Record<string, any>[], operation: string } {
    let cellsCleaned = 0;
    
    const cleanedData = data.map(row => {
      const cleanedRow: Record<string, any> = {};
      headers.forEach(header => {
        let value = row[header];
        
        if (value === null || value === undefined) {
          cleanedRow[header] = null;
          return;
        }

        const originalValue = value;
        value = String(value);

        // Trim whitespace
        if (this.trimWhitespace) {
          value = value.trim();
        }

        // Normalize text
        if (this.normalizeText) {
          value = value
            .replace(/â€™/g, "'")
            .replace(/â€œ/g, '"')
            .replace(/â€/g, '"')
            .replace(/â€"/g, '—')
            .replace(/Â/g, '');
        }

        // Standardize null values
        if (this.standardizeNulls) {
          if (['null', 'NULL', 'nil', 'NIL', 'n/a', 'N/A', 'na', 'NA', '#N/A', '-', ''].includes(value)) {
            value = null;
          }
        }

        if (value !== originalValue) {
          cellsCleaned++;
        }

        cleanedRow[header] = value;
      });
      return cleanedRow;
    });

    return {
      data: cleanedData,
      operation: `Cleaned ${cellsCleaned} cells`
    };
  }

  private handleDuplicates(data: Record<string, any>[], headers: string[], identifierColumn: string): { data: Record<string, any>[], operation: string } {
    if (!headers.includes(identifierColumn)) {
      return { data, operation: 'Duplicate column not found, skipping' };
    }

    const identifierCounts: Record<string, number> = {};
    const duplicateGroups: Record<string, any[]> = {};
    
    data.forEach(row => {
      const id = String(row[identifierColumn]).trim();
      identifierCounts[id] = (identifierCounts[id] || 0) + 1;
      if (!duplicateGroups[id]) duplicateGroups[id] = [];
      duplicateGroups[id].push(row);
    });

    const duplicateCount = Object.values(identifierCounts).reduce((sum, count) => sum + Math.max(0, count - 1), 0);
    
    if (duplicateCount === 0) {
      return { data, operation: 'No duplicates found' };
    }

    switch (this.duplicateStrategy) {
      case DuplicateStrategy.REMOVE: {
        const uniqueData = Object.values(duplicateGroups).map(group => group[0]);
        return {
          data: uniqueData,
          operation: `Removed ${duplicateCount} duplicate rows`
        };
      }

      case DuplicateStrategy.AGGREGATE: {
        const numericColumns = headers.filter(header => {
          if (header === identifierColumn) return false;
          const values = data.map(row => row[header]).filter(v => v !== null && v !== undefined);
          const numericValues = values.map(v => Number(v)).filter(v => !Number.isNaN(v));
          return numericValues.length > values.length * 0.8;
        });

        const aggregatedData = Object.entries(duplicateGroups).map(([id, rows]) => {
          const aggregatedRow: Record<string, any> = { [identifierColumn]: id };
          
          headers.forEach(header => {
            if (header === identifierColumn) return;
            
            if (numericColumns.includes(header)) {
              const values = rows.map(r => Number(r[header])).filter(v => !Number.isNaN(v));
              aggregatedRow[header] = values.reduce((a, b) => a + b, 0);
            } else {
              const firstValue = rows.find(r => r[header] !== null && r[header] !== undefined)?.[header];
              aggregatedRow[header] = firstValue || '';
            }
          });
          
          return aggregatedRow;
        });

        return {
          data: aggregatedData,
          operation: `Aggregated ${duplicateCount} duplicates into ${aggregatedData.length} unique rows`
        };
      }

      case DuplicateStrategy.RENAME: {
        const nameCounters: Record<string, number> = {};
        const renamedData = data.map(row => {
          const id = String(row[identifierColumn]).trim();
          const newRow = { ...row };
          
          if (identifierCounts[id] > 1) {
            nameCounters[id] = (nameCounters[id] || 0) + 1;
            const suffix = nameCounters[id];
            newRow[identifierColumn] = `${id}_${suffix}`;
          }
          
          return newRow;
        });

        return {
          data: renamedData,
          operation: `Renamed ${duplicateCount} duplicate entries with unique suffixes`
        };
      }

      default:
        return { data, operation: 'No duplicate processing applied' };
    }
  }

  private inferAndCastTypes(data: Record<string, any>[], headers: string[]): { data: Record<string, any>[], operation: string } {
    let totalCasts = 0;
    const typeInferences: Record<string, string> = {};

    // Analyze each column
    headers.forEach(header => {
      const values = data.map(row => row[header]).filter(v => v !== null && v !== undefined && v !== '');
      const sampleValues = values.slice(0, 100);
      
      let inferredType = 'string';
      let confidence = 0;

      // Test for numeric type
      const numericValues = sampleValues.map(v => Number(v)).filter(v => !Number.isNaN(v));
      if (numericValues.length > sampleValues.length * 0.8) {
        inferredType = 'number';
        confidence = numericValues.length / sampleValues.length;
      }

      // Test for date type
      const dateValues = sampleValues.filter(v => {
        const date = new Date(v);
        return !Number.isNaN(date.getTime()) && date.getFullYear() > 1900;
      });
      if (dateValues.length > sampleValues.length * 0.7 && dateValues.length > numericValues.length) {
        inferredType = 'date';
        confidence = dateValues.length / sampleValues.length;
      }

      // Test for boolean type
      const booleanValues = sampleValues.filter(v => {
        const str = String(v).toLowerCase();
        return ['true', 'false', 'yes', 'no', '1', '0', 'y', 'n'].includes(str);
      });
      if (booleanValues.length > sampleValues.length * 0.9) {
        inferredType = 'boolean';
        confidence = booleanValues.length / sampleValues.length;
      }

      typeInferences[header] = inferredType;
    });

    // Apply type casting based on mode
    const threshold = this.typeInference === TypeInferenceMode.AGGRESSIVE ? 0.6 : 0.8;
    
    const castedData = data.map(row => {
      const newRow = { ...row };
      
      headers.forEach(header => {
        const value = row[header];
        const inferredType = typeInferences[header];
        
        if (value === null || value === undefined || value === '') {
          return;
        }

        try {
          switch (inferredType) {
            case 'number': {
              const numValue = Number(value);
              if (!Number.isNaN(numValue)) {
                newRow[header] = numValue;
                totalCasts++;
              }
              break;
            }
            case 'date': {
              const dateValue = new Date(value);
              if (!Number.isNaN(dateValue.getTime())) {
                newRow[header] = dateValue.toISOString().split('T')[0];
                totalCasts++;
              }
              break;
            }
            case 'boolean': {
              const str = String(value).toLowerCase();
              if (['true', 'yes', '1', 'y'].includes(str)) {
                newRow[header] = true;
                totalCasts++;
              } else if (['false', 'no', '0', 'n'].includes(str)) {
                newRow[header] = false;
                totalCasts++;
              }
              break;
            }
          }
        } catch (error) {
          // Keep original value if casting fails
        }
      });
      
      return newRow;
    });

    return {
      data: castedData,
      operation: `Inferred and cast ${totalCasts} values to appropriate types`
    };
  }

  private createOutputSpec(inputSpec: DataTableSpec): DataTableSpec {
    return {
      columns: inputSpec.columns,
      findColumnIndex: inputSpec.findColumnIndex
    };
  }

  configure(inSpecs: DataTableSpec[]): DataTableSpec[] {
    if (inSpecs.length === 0) {
      return [{
        columns: [],
        findColumnIndex: () => -1
      }];
    }
    return [inSpecs[0]]; // Output has same structure as input
  }

  loadSettings(settings: SettingsObject): void {
    this.cleaningStrategy = (settings.getString?.(DataCleaningNodeModel.CLEANING_STRATEGY_KEY, CleaningStrategy.BASIC) || CleaningStrategy.BASIC) as CleaningStrategy;
    this.duplicateStrategy = (settings.getString?.(DataCleaningNodeModel.DUPLICATE_STRATEGY_KEY, DuplicateStrategy.SKIP) || DuplicateStrategy.SKIP) as DuplicateStrategy;
    this.duplicateColumn = settings.getString?.(DataCleaningNodeModel.DUPLICATE_COLUMN_KEY, '') || '';
    this.typeInference = (settings.getString?.(DataCleaningNodeModel.TYPE_INFERENCE_KEY, TypeInferenceMode.SAFE) || TypeInferenceMode.SAFE) as TypeInferenceMode;
    this.trimWhitespace = settings.getBoolean?.(DataCleaningNodeModel.TRIM_WHITESPACE_KEY, true) ?? true;
    this.normalizeText = settings.getBoolean?.(DataCleaningNodeModel.NORMALIZE_TEXT_KEY, true) ?? true;
    this.standardizeNulls = settings.getBoolean?.(DataCleaningNodeModel.STANDARDIZE_NULLS_KEY, true) ?? true;
    this.removeEmptyRows = settings.getBoolean?.(DataCleaningNodeModel.REMOVE_EMPTY_ROWS_KEY, true) ?? true;
  }

  saveSettings(settings: SettingsObject): void {
    settings.set?.(DataCleaningNodeModel.CLEANING_STRATEGY_KEY, this.cleaningStrategy);
    settings.set?.(DataCleaningNodeModel.DUPLICATE_STRATEGY_KEY, this.duplicateStrategy);
    settings.set?.(DataCleaningNodeModel.DUPLICATE_COLUMN_KEY, this.duplicateColumn);
    settings.set?.(DataCleaningNodeModel.TYPE_INFERENCE_KEY, this.typeInference);
    settings.set?.(DataCleaningNodeModel.TRIM_WHITESPACE_KEY, this.trimWhitespace);
    settings.set?.(DataCleaningNodeModel.NORMALIZE_TEXT_KEY, this.normalizeText);
    settings.set?.(DataCleaningNodeModel.STANDARDIZE_NULLS_KEY, this.standardizeNulls);
    settings.set?.(DataCleaningNodeModel.REMOVE_EMPTY_ROWS_KEY, this.removeEmptyRows);
  }

  validateSettings(settings: SettingsObject): void {
    const duplicateStrategy = settings.getString?.(DataCleaningNodeModel.DUPLICATE_STRATEGY_KEY, DuplicateStrategy.SKIP);
    const duplicateColumn = settings.getString?.(DataCleaningNodeModel.DUPLICATE_COLUMN_KEY, '');
    
    if (duplicateStrategy !== DuplicateStrategy.SKIP && !duplicateColumn) {
      throw new Error('Duplicate column must be specified when using duplicate processing');
    }
  }
} 