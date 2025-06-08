# Modular Chart System

A comprehensive, modular chart library built on top of Nivo that provides a scalable architecture for managing multiple chart types.

## Architecture Overview

The chart system is built around a central registry pattern that allows for easy addition of new chart types while maintaining consistency and type safety.

### Key Components

1. **Chart Registry** (`ChartRegistry.ts`) - Central registration system
2. **Base Schemas** (`shared/BaseSchemas.ts`) - Common interfaces and types
3. **Chart Modules** - Individual chart implementations in their own folders
4. **Unified Components** - Components that work with any registered chart type

### Folder Structure

```
lib/chart/
├── shared/
│   └── BaseSchemas.ts          # Shared interfaces and types
├── scatter/                    # Scatter plot implementation
│   ├── ScatterSchema.ts        # Type definitions
│   ├── ScatterDataProcessor.ts # Data transformation logic
│   ├── ScatterRenderer.tsx     # React component
│   ├── ScatterConfig.tsx       # Configuration UI
│   └── index.ts               # Module exports
├── bar/                       # Bar chart implementation
│   ├── BarSchema.ts
│   ├── BarDataProcessor.ts
│   ├── BarRenderer.tsx
│   ├── BarConfig.tsx
│   └── index.ts
├── line/                      # Line chart implementation (simplified)
├── pie/                       # Pie chart implementation (simplified)
├── heatmap/                   # Heatmap implementation (simplified)
├── radar/                     # Radar chart implementation (simplified)
├── areaBump/                  # Area bump implementation (simplified)
├── ChartRegistry.ts           # Central registry
├── UnifiedChartRenderer.tsx   # Dynamic renderer
├── UnifiedChartConfig.tsx     # Dynamic configuration
├── index.ts                   # Main exports
└── README.md                  # This file
```

## Currently Implemented Chart Types

### Fully Implemented
- **Scatter Plot** - Complete implementation with detailed configuration
- **Bar Chart** - Complete implementation with Nivo integration

### Simplified Implementations
- **Line Chart** - Basic schema and placeholder components
- **Pie Chart** - Basic schema and placeholder components  
- **Heatmap** - Basic schema and placeholder components
- **Radar Chart** - Basic schema and placeholder components
- **Area Bump** - Basic schema and placeholder components

## Usage Examples

### Basic Usage

```typescript
import { chartRegistry, ChartType, ChartConfig } from '@/lib/chart';

// Get supported chart types
const supportedTypes = chartRegistry.getAvailableTypes();
console.log(supportedTypes); // ['scatter', 'bar', 'line', 'pie', 'heatmap', 'radar', 'areaBump']

// Process data for any chart type
const data = chartRegistry.processData('scatter', csvData, scatterConfig);
```

### Using Unified Components

```tsx
import { UnifiedChartRenderer, UnifiedChartConfig } from '@/lib/chart';

function MyChart({ chartType, data, config, onConfigChange }) {
  return (
    <div>
      <UnifiedChartRenderer 
        chartType={chartType}
        data={data}
        config={config}
      />
      <UnifiedChartConfig
        chartType={chartType}
        config={config}
        onChange={onConfigChange}
      />
    </div>
  );
}
```

### Direct Module Usage

```tsx
import { ScatterRenderer, ScatterConfig, processScatterData } from '@/lib/chart/scatter';

function ScatterChart({ csvData, config, onConfigChange }) {
  const data = processScatterData(csvData, config);
  
  return (
    <div>
      <ScatterRenderer data={data} config={config} />
      <ScatterConfig config={config} onChange={onConfigChange} />
    </div>
  );
}
```

## Adding a New Chart Type

To add a new chart type, follow these steps:

### 1. Create the Chart Module Folder

```
lib/chart/newChartType/
├── NewChartTypeSchema.ts
├── NewChartTypeDataProcessor.ts  
├── NewChartTypeRenderer.tsx
├── NewChartTypeConfig.tsx
└── index.ts
```

### 2. Define the Schema

```typescript
// NewChartTypeSchema.ts
import type { BaseChartConfig } from '../shared/BaseSchemas';

export interface NewChartTypeConfig extends BaseChartConfig {
  chartType: 'newChartType';
  dataMapping: {
    // Define your data mapping requirements
  };
  // Add chart-specific properties
}

export const DATA_MAPPING_EXAMPLE = {
  description: "Description of what this chart does",
  example: {
    csvColumns: ["Column1", "Column2"],
    dataMapping: {
      // Example mapping
    },
    description: "Example description"
  }
};
```

### 3. Implement Data Processor

```typescript
// NewChartTypeDataProcessor.ts
import type { NewChartTypeConfig } from './NewChartTypeSchema';

export function processNewChartTypeData(csvData: string, config: NewChartTypeConfig): any[] {
  // Implement data processing logic
  return [];
}

export function getRequiredColumns(config: NewChartTypeConfig): string[] {
  // Return required column names
  return [];
}

export function validateCsvForNewChartType(csvData: string, config: NewChartTypeConfig) {
  // Implement validation logic
  return { valid: true, missingColumns: [], availableColumns: [] };
}
```

### 4. Create Renderer Component

```tsx
// NewChartTypeRenderer.tsx
import React from 'react';
import type { NewChartTypeConfig } from './NewChartTypeSchema';

interface NewChartTypeRendererProps {
  data: any[];
  config: NewChartTypeConfig;
  theme?: any;
}

export const NewChartTypeRenderer: React.FC<NewChartTypeRendererProps> = ({
  data,
  config,
  theme
}) => {
  // Implement chart rendering using Nivo or other charting library
  return <div>Chart goes here</div>;
};
```

### 5. Create Configuration Component

```tsx
// NewChartTypeConfig.tsx
import React from 'react';
import type { NewChartTypeConfig } from './NewChartTypeSchema';

interface NewChartTypeConfigProps {
  config: NewChartTypeConfig;
  onChange: (updates: Partial<NewChartTypeConfig>) => void;
}

export const NewChartTypeConfig: React.FC<NewChartTypeConfigProps> = ({ 
  config, 
  onChange 
}) => {
  // Implement configuration UI
  return <div>Configuration controls go here</div>;
};
```

### 6. Create Module Index

```typescript
// index.ts
export type { NewChartTypeConfig } from './NewChartTypeSchema';
export { DATA_MAPPING_EXAMPLE } from './NewChartTypeSchema';
export { 
  processNewChartTypeData, 
  getRequiredColumns, 
  validateCsvForNewChartType 
} from './NewChartTypeDataProcessor';
export { NewChartTypeRenderer } from './NewChartTypeRenderer';
export { NewChartTypeConfig } from './NewChartTypeConfig';
```

### 7. Register in ChartRegistry.ts

```typescript
// Add to imports
import { 
  NewChartTypeConfig, 
  processNewChartTypeData, 
  NewChartTypeRenderer, 
  NewChartTypeConfig as NewChartTypeConfigComponent,
  DATA_MAPPING_EXAMPLE as NewChartTypeMappingExample 
} from './newChartType';

// Update type unions
export type ChartType = 'scatter' | 'bar' | /* ... */ | 'newChartType';
export type ChartConfig = ScatterPlotConfig | /* ... */ | NewChartTypeConfig;

// Register the module
chartRegistry.register({
  chartType: 'newChartType',
  schema: 'NewChartTypeConfig',
  dataProcessor: processNewChartTypeData,
  renderer: NewChartTypeRenderer,
  configComponent: NewChartTypeConfigComponent,
  dataMappingExample: NewChartTypeMappingExample,
  getRequiredColumns: (config: NewChartTypeConfig) => {
    // Implementation
  },
  validateCsv: (csvData: string, config: NewChartTypeConfig) => {
    // Implementation
  }
});
```

### 8. Export from Main Index

```typescript
// lib/chart/index.ts
export * from './newChartType';
```

## Benefits of This Architecture

1. **Modularity** - Each chart type is self-contained
2. **Scalability** - Easy to add new chart types without affecting existing ones
3. **Type Safety** - Strong TypeScript typing throughout
4. **Consistency** - All charts follow the same interface pattern
5. **Maintainability** - Changes to one chart don't affect others
6. **Flexibility** - Charts can be used individually or through unified components
7. **Documentation** - Each chart type includes data mapping examples

## Migration from Legacy System

The new system maintains backward compatibility through the unified components. Existing code can gradually migrate to use specific chart modules for better performance and type safety.

Legacy usage:
```typescript
import ChartRenderer from '@/lib/chart/ChartRenderer';
```

New unified usage:
```typescript
import { UnifiedChartRenderer } from '@/lib/chart';
```

Direct module usage (recommended):
```typescript
import { ScatterRenderer } from '@/lib/chart/scatter';
```

## Future Enhancements

1. **Complete Implementations** - Finish implementing all chart types with full Nivo integration
2. **Chart Templates** - Pre-configured chart templates for common use cases
3. **Dynamic Loading** - Lazy load chart modules for better performance
4. **Plugin System** - Allow third-party chart extensions
5. **Theme System** - Comprehensive theming support across all chart types
6. **Animation Presets** - Pre-configured animation options
7. **Export Functionality** - Built-in chart export capabilities 