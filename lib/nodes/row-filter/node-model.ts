import { NodeModel, type DataTable, type DataTableSpec, type ExecutionContext, type SettingsObject, type Cell } from '../core';

// Simple Cell implementation
class SimpleCell implements Cell {
  constructor(private value: any, public readonly type: string) {}
  
  getValue(): any {
    return this.value;
  }
}

export interface FilterCondition {
  column: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'between';
  value: string | number | (string | number)[];
  caseSensitive: boolean;
}

export enum FilterLogic {
  AND = 'AND',
  OR = 'OR'
}

export class RowFilterNodeModel extends NodeModel {
  private static FILTERS_KEY = 'filters';
  private static LOGIC_KEY = 'logic';

  // Settings
  private filters: FilterCondition[] = [];
  private logic: FilterLogic = FilterLogic.AND;

  constructor() {
    super(1, 1); // 1 input, 1 output
  }

  async execute(inData: DataTable[], context: ExecutionContext): Promise<DataTable[]> {
    const inputTable = inData[0];
    if (!inputTable || inputTable.size === 0) {
      throw new Error('No input data provided for filtering');
    }

    if (this.filters.length === 0) {
      context.setProgress(1.0, 'No filters applied - returning original data');
      return [inputTable];
    }

    context.setProgress(0.1, 'Starting row filtering...');
    
    // Convert table to rows for easier processing
    const rows = this.convertTableToRows(inputTable);
    const headers = inputTable.spec.columns.map(col => col.name);

    context.setProgress(0.3, 'Applying filter conditions...');
    
    // Apply filters
    const filteredRows = rows.filter(row => {
      const results = this.filters.map(filter => this.evaluateFilter(row, filter));
      return this.logic === FilterLogic.AND ? results.every(r => r) : results.some(r => r);
    });

    context.setProgress(0.7, 'Creating filtered output...');

    // Create output table
    const outputSpec = this.createOutputSpec(inputTable.spec);
    const output = context.createDataTable(outputSpec);

    filteredRows.forEach((row, index) => {
      const cells = headers.map(header => {
        const value = row[header];
        const originalCol = inputTable.spec.columns.find(col => col.name === header);
        const type = originalCol?.type || 'string';
        return new SimpleCell(value, type);
      });
      output.addRow(`filtered-row-${index}`, cells);
    });

    const filterDescription = this.filters.map(f => 
      `${f.column} ${f.operator} ${Array.isArray(f.value) ? f.value.join(',') : f.value}`
    ).join(` ${this.logic} `);

    context.setProgress(1.0, `Filtered ${rows.length} → ${filteredRows.length} rows (${filterDescription})`);
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

  private evaluateFilter(row: Record<string, any>, filter: FilterCondition): boolean {
    const cellValue = row[filter.column];
    const { operator, value, caseSensitive } = filter;
    
    if (cellValue === null || cellValue === undefined) {
      return false;
    }
    
    const cellStr = caseSensitive ? String(cellValue) : String(cellValue).toLowerCase();
    const compareValue = Array.isArray(value) ? value : [value];
    const compareStr = caseSensitive ? compareValue : compareValue.map(v => String(v).toLowerCase());
    
    switch (operator) {
      case '>':
        return Number(cellValue) > Number(compareValue[0]);
      case '<':
        return Number(cellValue) < Number(compareValue[0]);
      case '>=':
        return Number(cellValue) >= Number(compareValue[0]);
      case '<=':
        return Number(cellValue) <= Number(compareValue[0]);
      case '==':
        return cellStr === String(compareStr[0]);
      case '!=':
        return cellStr !== String(compareStr[0]);
      case 'contains':
        return cellStr.includes(String(compareStr[0]));
      case 'startsWith':
        return cellStr.startsWith(String(compareStr[0]));
      case 'endsWith':
        return cellStr.endsWith(String(compareStr[0]));
      case 'in':
        return compareStr.some(val => cellStr === String(val));
      case 'between':
        if (compareValue.length >= 2) {
          const numValue = Number(cellValue);
          return numValue >= Number(compareValue[0]) && numValue <= Number(compareValue[1]);
        }
        return false;
      default:
        return false;
    }
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
    const filtersData = settings.getString?.(RowFilterNodeModel.FILTERS_KEY, '[]') || '[]';
    try {
      this.filters = JSON.parse(filtersData) || [];
    } catch {
      this.filters = [];
    }
    
    this.logic = (settings.getString?.(RowFilterNodeModel.LOGIC_KEY, FilterLogic.AND) || FilterLogic.AND) as FilterLogic;
  }

  saveSettings(settings: SettingsObject): void {
    settings.set?.(RowFilterNodeModel.FILTERS_KEY, JSON.stringify(this.filters));
    settings.set?.(RowFilterNodeModel.LOGIC_KEY, this.logic);
  }

  validateSettings(settings: SettingsObject): void {
    const filtersData = settings.getString?.(RowFilterNodeModel.FILTERS_KEY, '[]') || '[]';
    let filters: FilterCondition[];
    
    try {
      filters = JSON.parse(filtersData) || [];
    } catch {
      throw new Error('Invalid filter configuration');
    }
    
    if (filters.length === 0) {
      // Allow empty filters - will just pass through all data
      return;
    }
    
    for (const filter of filters) {
      if (!filter.column) {
        throw new Error('All filters must specify a column');
      }
      if (!filter.operator) {
        throw new Error('All filters must specify an operator');
      }
      if (filter.value === null || filter.value === undefined) {
        throw new Error('All filters must specify a value');
      }
    }
  }

  // Public getters and setters for dialog access
  public getFilters(): FilterCondition[] {
    return [...this.filters];
  }

  public getLogic(): FilterLogic {
    return this.logic;
  }

  public setFilters(filters: FilterCondition[]): void {
    this.filters = [...filters];
  }

  public setLogic(logic: FilterLogic): void {
    this.logic = logic;
  }
} 