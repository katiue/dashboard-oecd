import { NodeModel, DataTable, DataTableSpec, ExecutionContext, SettingsObject, Cell } from '../core';

// Simple Cell implementation
class SimpleCell implements Cell {
  constructor(private value: any, public readonly type: string) {}
  
  getValue(): any {
    return this.value;
  }
}

export class DataInputNodeModel extends NodeModel {
  private static CSV_URL_KEY = 'csv_url';
  private csvUrl: string = '';
  
  // Public getter for csvUrl
  public getCsvUrl(): string {
    return this.csvUrl;
  }
  
  constructor() {
    super(0, 1); // 0 inputs, 1 output
  }

  async execute(inData: DataTable[], context: ExecutionContext): Promise<DataTable[]> {
    if (!this.csvUrl) {
      throw new Error('CSV URL is required. Please configure the node.');
    }

    try {
      context.setProgress(0.1, 'Fetching CSV data...');
      
      // Fetch CSV data from URL
      const response = await fetch(this.csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      context.setProgress(0.5, 'Parsing CSV data...');
      
      // Parse CSV
      const lines = csvText.trim().split('\n');
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }
      
      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1);
      
      if (rows.length === 0) {
        throw new Error('CSV file contains no data rows');
      }
      
      // Determine column types by sampling first few rows
      const columnTypes = headers.map((header, index) => {
        const sampleValues = rows.slice(0, Math.min(10, rows.length))
          .map(row => {
            const values = row.split(',');
            return values[index]?.trim().replace(/"/g, '') || '';
          })
          .filter(v => v !== '');
        
        // Check if values are numeric
        const numericValues = sampleValues.map(v => Number(v)).filter(v => !isNaN(v));
        if (numericValues.length > sampleValues.length * 0.8) {
          return 'number';
        }
        
        // Check if values are dates
        const dateValues = sampleValues.filter(v => !isNaN(Date.parse(v)));
        if (dateValues.length > sampleValues.length * 0.7) {
          return 'date';
        }
        
        return 'string';
      });
      
      context.setProgress(0.7, 'Creating data table...');
      
      // Create output table
      const output = context.createDataTable({
        columns: headers.map((name, index) => ({ 
          name, 
          type: columnTypes[index] 
        })),
        findColumnIndex: (name: string) => headers.indexOf(name)
      });

      // Add data rows
      context.setProgress(0.8, 'Processing data rows...');
      
      rows.forEach((line, rowIndex) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const cells = headers.map((header, index) => {
          let value: any = values[index] || '';
          const type = columnTypes[index];
          
          // Convert based on detected type
          if (type === 'number' && value !== '') {
            const numValue = Number(value);
            value = isNaN(numValue) ? 0 : numValue;
          } else if (type === 'date' && value !== '') {
            const dateValue = new Date(value);
            value = isNaN(dateValue.getTime()) ? value : dateValue.toISOString();
          }
          
          return new SimpleCell(value, type);
        });
        
        output.addRow(`row-${rowIndex}`, cells);
      });

      context.setProgress(1.0, 'Completed');
      return [output.close()];
      
    } catch (error) {
      throw new Error(`Failed to load CSV data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  configure(inSpecs: DataTableSpec[]): DataTableSpec[] {
    if (!this.csvUrl) {
      // Return empty spec if no URL configured
      return [{
        columns: [],
        findColumnIndex: () => -1
      }];
    }
    
    // We can't determine the output spec without actually fetching the data
    // For now, return a generic spec
    return [{
      columns: [
        { name: 'data', type: 'string' }
      ],
      findColumnIndex: (name: string) => name === 'data' ? 0 : -1
    }];
  }

  loadSettings(settings: SettingsObject): void {
    this.csvUrl = settings.getString ? settings.getString(DataInputNodeModel.CSV_URL_KEY, '') : 
                  (settings as any)[DataInputNodeModel.CSV_URL_KEY] || '';
  }

  saveSettings(settings: SettingsObject): void {
    if (settings.set) {
      settings.set(DataInputNodeModel.CSV_URL_KEY, this.csvUrl);
    } else {
      (settings as any)[DataInputNodeModel.CSV_URL_KEY] = this.csvUrl;
    }
  }

  validateSettings(settings: SettingsObject): void {
    const url = settings.getString ? settings.getString(DataInputNodeModel.CSV_URL_KEY, '') : 
                (settings as any)[DataInputNodeModel.CSV_URL_KEY] || '';
    
    if (!url) {
      throw new Error('CSV URL is required');
    }
    
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }
  }
} 