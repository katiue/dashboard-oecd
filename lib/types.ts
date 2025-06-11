export type DataPart = { type: 'append-message'; message: string };

export interface Cell {
    readonly type: string;
    getValue(): any;
  }
  
  export interface DataRow {
    readonly key: string;
    getCell(index: number): Cell;
    readonly cells: Cell[];
  }
  
  export interface DataTable {
    readonly spec: DataTableSpec;
    readonly rows: DataRow[];
    forEach(callback: (row: DataRow) => void): void;
    readonly size: number;
  }
  
  export interface ColumnSpec {
    readonly name: string;
    readonly type: string;
  }
  
  export interface DataTableSpec {
    readonly columns: ColumnSpec[];
    findColumnIndex(name: string): number;
  }
  
  export interface ExecutionContext {
    createDataTable(spec: DataTableSpec): DataTableContainer;
    checkCanceled(): void;
    setProgress(progress: number, message?: string): void;
  }
  
  export interface DataTableContainer {
    addRow(key: string, cells: Cell[]): void;
    close(): DataTable;
  }
  
  export interface SettingsObject {
    getString(key: string, defaultValue?: string): string;
    getNumber(key: string, defaultValue?: number): number;
    getBoolean(key: string, defaultValue?: boolean): boolean;
    set(key: string, value: any): void;
  }
  
  export interface NodeMetadata {
    id: string;
    name: string;
    description: string;
    category: string[];
    icon?: string;
    keywords?: string[];
  }