import { NodeModel, type DataTable, type DataTableSpec, type ExecutionContext, type SettingsObject, type Cell } from '../core';

// Simple Cell implementation
class SimpleCell implements Cell {
  constructor(private value: any, public readonly type: string) {}
  
  getValue(): any {
    return this.value;
  }
}

export interface PythonPortConfig {
  name: string;
  type: 'data' | 'parameter';
  dataType: 'table' | 'number' | 'string' | 'boolean';
  required: boolean;
}

export class PythonScriptNodeModel extends NodeModel {
  private static SCRIPT_CODE_KEY = 'script_code';
  private static INPUT_PORTS_KEY = 'input_ports';
  private static OUTPUT_PORTS_KEY = 'output_ports';
  private static LIBRARIES_KEY = 'libraries';

  // Settings
  private scriptCode = `# Python script for data processing
import pandas as pd
import numpy as np

def process_data(input_data):
    """
    Process the input data and return results.
    
    Args:
        input_data: Dictionary containing input data tables
                   e.g., {'input_0': DataFrame, 'input_1': DataFrame}
    
    Returns:
        Dictionary containing output data tables
        e.g., {'output_0': DataFrame, 'output_1': DataFrame}
    """
    
    # Example: Process the first input table
    if 'input_0' in input_data:
        df = input_data['input_0']
        
        # Perform some data processing
        result = df.copy()
        
        # Example transformation
        if not df.empty:
            # Add a computed column
            if 'value' in df.columns:
                result['value_squared'] = df['value'] ** 2
        
        return {'output_0': result}
    
    return {}
`;

  private inputPorts: PythonPortConfig[] = [
    { name: 'input_0', type: 'data', dataType: 'table', required: true }
  ];
  
  private outputPorts: PythonPortConfig[] = [
    { name: 'output_0', type: 'data', dataType: 'table', required: true }
  ];

  private libraries: string[] = ['pandas', 'numpy'];

  constructor() {
    // Dynamic ports - will be updated based on configuration
    super(1, 1);
  }

  async execute(inData: DataTable[], context: ExecutionContext): Promise<DataTable[]> {
    if (!this.scriptCode.trim()) {
      throw new Error('Python script is empty. Please configure the node with valid Python code.');
    }

    context.setProgress(0.1, 'Preparing Python execution environment...');

    try {
      // Convert input data tables to a format suitable for Python
      const inputDataDict: Record<string, any[]> = {};
      
      inData.forEach((table, index) => {
        if (table && table.size > 0) {
          const portName = this.inputPorts[index]?.name || `input_${index}`;
          inputDataDict[portName] = this.convertTableToRecords(table);
        }
      });

      context.setProgress(0.3, 'Converting data for Python processing...');

      // Simulate Python execution (in a real implementation, this would use a Python runtime)
      const result = await this.simulatePythonExecution(inputDataDict, context);

      context.setProgress(0.8, 'Converting results back to data tables...');

      // Convert results back to DataTable format
      const outputTables: DataTable[] = [];
      
      for (let i = 0; i < this.outputPorts.length; i++) {
        const portName = this.outputPorts[i].name;
        const portData = result[portName];
        
        if (portData && Array.isArray(portData) && portData.length > 0) {
          const outputTable = this.convertRecordsToTable(portData, context, i);
          outputTables.push(outputTable);
        } else {
          // Create empty table for missing outputs
          const emptyTable = this.createEmptyTable(context);
          outputTables.push(emptyTable);
        }
      }

      context.setProgress(1.0, 'Python script execution completed');
      return outputTables;

    } catch (error) {
      throw new Error(`Python script execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private convertTableToRecords(table: DataTable): any[] {
    const records: any[] = [];
    table.forEach(row => {
      const record: Record<string, any> = {};
      table.spec.columns.forEach((col, index) => {
        record[col.name] = row.cells[index].getValue();
      });
      records.push(record);
    });
    return records;
  }

  private async simulatePythonExecution(inputData: Record<string, any[]>, context: ExecutionContext): Promise<Record<string, any[]>> {
    // Simulate Python processing
    context.setProgress(0.5, 'Executing Python script...');

    // In a real implementation, this would:
    // 1. Start a Python subprocess or use a Python runtime
    // 2. Install required libraries
    // 3. Execute the user's script with the input data
    // 4. Return the results

    // For simulation, we'll perform some basic data processing
    const result: Record<string, any[]> = {};

    // Simple simulation: if there's input data, process it
    if (inputData.input_0 && inputData.input_0.length > 0) {
      const inputRecords = inputData.input_0;
      const processedRecords = inputRecords.map((record, index) => {
        const newRecord = { ...record };
        
        // Simulate adding a row index
        newRecord.row_index = index;
        
        // Simulate processing numeric columns
        Object.keys(record).forEach(key => {
          const value = record[key];
          if (typeof value === 'number') {
            newRecord[`${key}_processed`] = value * 2; // Simple transformation
          }
        });
        
        return newRecord;
      });

      result.output_0 = processedRecords;
    }

    return result;
  }

  private convertRecordsToTable(records: any[], context: ExecutionContext, outputIndex: number): DataTable {
    if (records.length === 0) {
      return this.createEmptyTable(context);
    }

    // Infer schema from first record
    const sampleRecord = records[0];
    const columns = Object.keys(sampleRecord).map(key => ({
      name: key,
      type: this.inferColumnType(sampleRecord[key])
    }));

    const spec: DataTableSpec = {
      columns,
      findColumnIndex: (name: string) => columns.findIndex(col => col.name === name)
    };

    const container = context.createDataTable(spec);

    records.forEach((record, index) => {
      const cells = columns.map(col => {
        const value = record[col.name];
        return new SimpleCell(value, col.type);
      });
      container.addRow(`python-output-${outputIndex}-${index}`, cells);
    });

    return container.close();
  }

  private createEmptyTable(context: ExecutionContext): DataTable {
    const spec: DataTableSpec = {
      columns: [],
      findColumnIndex: () => -1
    };
    const container = context.createDataTable(spec);
    return container.close();
  }

  private inferColumnType(value: any): string {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    return 'string';
  }

  configure(inSpecs: DataTableSpec[]): DataTableSpec[] {
    // Create output specs based on configured output ports
    const outputSpecs: DataTableSpec[] = [];
    
    for (const outputPort of this.outputPorts) {
      if (outputPort.dataType === 'table') {
        // For Python scripts, we can't know the exact output schema until execution
        // So we return a generic spec
        outputSpecs.push({
          columns: [
            { name: 'data', type: 'string' }
          ],
          findColumnIndex: (name: string) => name === 'data' ? 0 : -1
        });
      }
    }
    
    return outputSpecs;
  }

  loadSettings(settings: SettingsObject): void {
    this.scriptCode = settings.getString?.(PythonScriptNodeModel.SCRIPT_CODE_KEY, this.scriptCode) || this.scriptCode;
    
    const inputPortsJson = settings.getString?.(PythonScriptNodeModel.INPUT_PORTS_KEY, '[]') || '[]';
    try {
      this.inputPorts = JSON.parse(inputPortsJson);
    } catch {
      this.inputPorts = [{ name: 'input_0', type: 'data', dataType: 'table', required: true }];
    }
    
    const outputPortsJson = settings.getString?.(PythonScriptNodeModel.OUTPUT_PORTS_KEY, '[]') || '[]';
    try {
      this.outputPorts = JSON.parse(outputPortsJson);
    } catch {
      this.outputPorts = [{ name: 'output_0', type: 'data', dataType: 'table', required: true }];
    }
    
    const librariesJson = settings.getString?.(PythonScriptNodeModel.LIBRARIES_KEY, '[]') || '[]';
    try {
      this.libraries = JSON.parse(librariesJson);
    } catch {
      this.libraries = ['pandas', 'numpy'];
    }
  }

  saveSettings(settings: SettingsObject): void {
    settings.set?.(PythonScriptNodeModel.SCRIPT_CODE_KEY, this.scriptCode);
    settings.set?.(PythonScriptNodeModel.INPUT_PORTS_KEY, JSON.stringify(this.inputPorts));
    settings.set?.(PythonScriptNodeModel.OUTPUT_PORTS_KEY, JSON.stringify(this.outputPorts));
    settings.set?.(PythonScriptNodeModel.LIBRARIES_KEY, JSON.stringify(this.libraries));
  }

  validateSettings(settings: SettingsObject): void {
    const scriptCode = settings.getString?.(PythonScriptNodeModel.SCRIPT_CODE_KEY, '');
    if (!scriptCode || scriptCode.trim().length === 0) {
      throw new Error('Python script code is required');
    }

    const inputPortsJson = settings.getString?.(PythonScriptNodeModel.INPUT_PORTS_KEY, '[]') || '[]';
    const outputPortsJson = settings.getString?.(PythonScriptNodeModel.OUTPUT_PORTS_KEY, '[]') || '[]';
    
    try {
      const inputPorts = JSON.parse(inputPortsJson);
      const outputPorts = JSON.parse(outputPortsJson);
      
      if (!Array.isArray(inputPorts) || !Array.isArray(outputPorts)) {
        throw new Error('Port configurations must be arrays');
      }
      
      if (outputPorts.length === 0) {
        throw new Error('At least one output port is required');
      }
      
    } catch (error) {
      throw new Error('Invalid port configuration format');
    }
  }

  // Override to return dynamic port counts
  getInputPortCount(): number {
    return this.inputPorts.length;
  }

  getOutputPortCount(): number {
    return this.outputPorts.length;
  }

  // Public getters for the dialog
  public getScriptCode(): string {
    return this.scriptCode;
  }

  public getInputPorts(): PythonPortConfig[] {
    return this.inputPorts;
  }

  public getOutputPorts(): PythonPortConfig[] {
    return this.outputPorts;
  }

  public getLibraries(): string[] {
    return this.libraries;
  }
} 