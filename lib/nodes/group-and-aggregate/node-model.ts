import { 
  NodeModel, 
  DataTable, 
  DataTableSpec, 
  ExecutionContext, 
  SettingsObject,
  DataRow,
  Cell,
  ColumnSpec
} from '../core';

// Define supported aggregation methods
export enum AggregationMethod {
  SUM = 'SUM',
  AVERAGE = 'AVERAGE',
  MIN = 'MIN',
  MAX = 'MAX',
  COUNT = 'COUNT',
  FIRST = 'FIRST',
  LAST = 'LAST'
}

// Define column aggregation configuration
export interface ColumnAggregation {
  columnName: string;
  method: AggregationMethod;
  newColumnName: string;
}

/**
 * Node model that groups data by specified columns and aggregates other columns
 */
export class GroupAndAggregateNodeModel extends NodeModel {
  // Settings keys
  private static GROUP_COLUMNS_KEY = 'group_columns';
  private static AGGREGATIONS_KEY = 'aggregations';
  
  // Settings values
  private groupColumns: string[] = [];
  private aggregations: ColumnAggregation[] = [];

  constructor() {
    // 1 input port, 1 output port
    super(1, 1);
  }

  /**
   * Main execution method - groups and aggregates data
   */
  async execute(inData: DataTable[], context: ExecutionContext): Promise<DataTable[]> {
    const inputTable = inData[0];
    const inputSpec = inputTable.spec;
    
    // Create output spec based on group columns and aggregations
    const outputSpec = this.createOutputSpec(inputSpec);
    
    // Create output container
    const container = context.createDataTable(outputSpec);
    
    // Get column indices for grouping
    const groupIndices = this.groupColumns.map(col => inputSpec.findColumnIndex(col));
    
    // Get column indices and methods for aggregation
    const aggConfigs = this.aggregations.map(agg => ({
      colIndex: inputSpec.findColumnIndex(agg.columnName),
      method: agg.method,
      newName: agg.newColumnName
    }));
    
    // Create groups map - key is the group values concatenated, value is aggregated data
    const groups = new Map<string, any[][]>();
    
    // First pass: group the data
    let rowCount = 0;
    inputTable.forEach((row: DataRow) => {
      // Report progress
      if (rowCount % 100 === 0) {
        context.checkCanceled();
        context.setProgress(rowCount / inputTable.size * 0.5, 
          `Grouping row ${rowCount} of ${inputTable.size}`);
      }
      rowCount++;
      
      // Create group key from the group column values
      const groupKey = groupIndices
        .map(idx => String(row.cells[idx].getValue()))
        .join('|');
      
      // Get or create group data array
      if (!groups.has(groupKey)) {
        // Initialize with empty arrays for each aggregation
        groups.set(groupKey, aggConfigs.map(() => []));
      }
      
      // Add values to the appropriate aggregation arrays
      const groupData = groups.get(groupKey)!;
      aggConfigs.forEach((config, i) => {
        groupData[i].push(row.cells[config.colIndex].getValue());
      });
    });
    
    // Second pass: compute aggregations and output results
    let groupCount = 0;
    const totalGroups = groups.size;
    
    for (const [groupKey, groupData] of groups.entries()) {
      // Report progress
      if (groupCount % 100 === 0) {
        context.checkCanceled();
        context.setProgress(0.5 + (groupCount / totalGroups * 0.5), 
          `Aggregating group ${groupCount} of ${totalGroups}`);
      }
      groupCount++;
      
      // Extract group values
      const groupValues = groupKey.split('|');
      
      // Create cells array for the new row
      const cells: Cell[] = [];
      
      // Add group column cells
      groupValues.forEach((value, i) => {
        const originalColIndex = groupIndices[i];
        const colType = inputSpec.columns[originalColIndex].type;
        cells.push(this.createCell(value, colType));
      });
      
      // Add aggregation cells
      groupData.forEach((values, i) => {
        const config = aggConfigs[i];
        const aggregatedValue = this.computeAggregation(values, config.method);
        const colType = this.getAggregatedType(config.method, inputSpec.columns[config.colIndex].type);
        cells.push(this.createCell(aggregatedValue, colType));
      });
      
      // Add row to output table with a unique key
      container.addRow(`group_${groupCount}`, cells);
    }
    
    // Finish output table
    return [container.close()];
  }

  /**
   * Creates the output table specification
   */
  private createOutputSpec(inputSpec: DataTableSpec): DataTableSpec {
    const columns: ColumnSpec[] = [];
    
    // Add group columns
    this.groupColumns.forEach(colName => {
      const colIndex = inputSpec.findColumnIndex(colName);
      columns.push(inputSpec.columns[colIndex]);
    });
    
    // Add aggregation columns
    this.aggregations.forEach(agg => {
      const origColIndex = inputSpec.findColumnIndex(agg.columnName);
      const origType = inputSpec.columns[origColIndex].type;
      const newType = this.getAggregatedType(agg.method, origType);
      
      columns.push({
        name: agg.newColumnName,
        type: newType
      });
    });
    
    return { 
      columns,
      findColumnIndex: (name: string): number => {
        return columns.findIndex(col => col.name === name);
      }
    };
  }

  /**
   * Computes aggregation on a set of values
   */
  private computeAggregation(values: any[], method: AggregationMethod): any {
    switch (method) {
      case AggregationMethod.SUM:
        return values.reduce((sum, val) => sum + Number(val), 0);
        
      case AggregationMethod.AVERAGE:
        if (values.length === 0) return null;
        return values.reduce((sum, val) => sum + Number(val), 0) / values.length;
        
      case AggregationMethod.MIN:
        if (values.length === 0) return null;
        return Math.min(...values.map(v => Number(v)));
        
      case AggregationMethod.MAX:
        if (values.length === 0) return null;
        return Math.max(...values.map(v => Number(v)));
        
      case AggregationMethod.COUNT:
        return values.length;
        
      case AggregationMethod.FIRST:
        return values.length > 0 ? values[0] : null;
        
      case AggregationMethod.LAST:
        return values.length > 0 ? values[values.length - 1] : null;
        
      default:
        return null;
    }
  }

  /**
   * Determines the resulting data type after aggregation
   */
  private getAggregatedType(method: AggregationMethod, originalType: string): string {
    switch (method) {
      case AggregationMethod.COUNT:
        return 'number';
        
      case AggregationMethod.SUM:
      case AggregationMethod.AVERAGE:
      case AggregationMethod.MIN:
      case AggregationMethod.MAX:
        return originalType === 'number' ? 'number' : 'string';
        
      case AggregationMethod.FIRST:
      case AggregationMethod.LAST:
        return originalType;
        
      default:
        return 'string';
    }
  }

  /**
   * Creates a cell with the appropriate type
   */
  private createCell(value: any, type: string): Cell {
    return {
      type,
      getValue: () => value
    };
  }

  /**
   * Validates input and defines output structure
   */
  configure(inSpecs: DataTableSpec[]): DataTableSpec[] {
    const inputSpec = inSpecs[0];
    
    // Validate group columns
    this.groupColumns.forEach(colName => {
      const colIndex = inputSpec.findColumnIndex(colName);
      if (colIndex < 0) {
        throw new Error(`Group column '${colName}' not found in input table`);
      }
    });
    
    // Validate aggregation columns
    this.aggregations.forEach(agg => {
      const colIndex = inputSpec.findColumnIndex(agg.columnName);
      if (colIndex < 0) {
        throw new Error(`Aggregation column '${agg.columnName}' not found in input table`);
      }
      
      // Validate numeric columns for numeric aggregations
      if ([AggregationMethod.SUM, AggregationMethod.AVERAGE, AggregationMethod.MIN, AggregationMethod.MAX].includes(agg.method)) {
        const colType = inputSpec.columns[colIndex].type;
        if (colType !== 'number' && agg.method !== AggregationMethod.COUNT) {
          throw new Error(`Column '${agg.columnName}' must be numeric for ${agg.method} aggregation`);
        }
      }
    });
    
    // Create output spec
    return [this.createOutputSpec(inputSpec)];
  }

  /**
   * Load settings from the settings object
   */
  loadSettings(settings: SettingsObject): void {
    this.groupColumns = JSON.parse(settings.getString ? 
      settings.getString(GroupAndAggregateNodeModel.GROUP_COLUMNS_KEY, '[]') :
      (settings as any)[GroupAndAggregateNodeModel.GROUP_COLUMNS_KEY] || '[]'
    );
    
    this.aggregations = JSON.parse(settings.getString ?
      settings.getString(GroupAndAggregateNodeModel.AGGREGATIONS_KEY, '[]') :
      (settings as any)[GroupAndAggregateNodeModel.AGGREGATIONS_KEY] || '[]'
    );
  }

  /**
   * Save settings to the settings object
   */
  saveSettings(settings: SettingsObject): void {
    settings.set(
      GroupAndAggregateNodeModel.GROUP_COLUMNS_KEY, 
      JSON.stringify(this.groupColumns)
    );
    
    settings.set(
      GroupAndAggregateNodeModel.AGGREGATIONS_KEY, 
      JSON.stringify(this.aggregations)
    );
  }

  /**
   * Validate settings
   */
  validateSettings(settings: SettingsObject): void {
    const groupCols = JSON.parse(settings.getString ? 
      settings.getString(GroupAndAggregateNodeModel.GROUP_COLUMNS_KEY, '[]') :
      (settings as any)[GroupAndAggregateNodeModel.GROUP_COLUMNS_KEY] || '[]'
    );
    
    const aggregations = JSON.parse(settings.getString ?
      settings.getString(GroupAndAggregateNodeModel.AGGREGATIONS_KEY, '[]') :
      (settings as any)[GroupAndAggregateNodeModel.AGGREGATIONS_KEY] || '[]'
    );
    
    if (groupCols.length === 0) {
      throw new Error('At least one group column must be specified');
    }
    
    if (aggregations.length === 0) {
      throw new Error('At least one aggregation must be specified');
    }
    
    // Validate aggregation config structure
    aggregations.forEach((agg: any) => {
      if (!agg.columnName || !agg.method || !agg.newColumnName) {
        throw new Error('Each aggregation must specify columnName, method, and newColumnName');
      }
      
      if (!Object.values(AggregationMethod).includes(agg.method)) {
        throw new Error(`Invalid aggregation method: ${agg.method}`);
      }
    });
  }
}