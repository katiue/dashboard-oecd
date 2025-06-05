# Chart Configuration System

## Overview

The chart configuration system provides a structured approach for AI agents to create and configure data visualizations without directly manipulating CSV data. This system separates concerns between chart property configuration (agent-controlled) and data manipulation (user/tool-controlled).

## Architecture

### Core Components

1. **ChartSchemas.ts** - TypeScript interfaces defining chart configurations
2. **configure-chart.ts** - AI tool for validating and creating chart configurations
3. **ChartDataProcessor.ts** - Data processing functions that convert CSV to Nivo format
4. **Chart Configuration Tool** - Agent-accessible tool for chart setup

### Key Features

- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Data Mapping**: Clear separation between CSV columns and chart dimensions  
- **Validation**: Zod schemas ensure valid chart configurations
- **Extensible**: Support for all major Nivo chart types

## Supported Chart Types

- **Bar Charts**: Categorical data with multiple value columns
- **Line Charts**: Time-series or sequential data with multiple lines
- **Pie Charts**: Part-to-whole relationships
- **Heatmaps**: Matrix data visualization  
- **Radar Charts**: Multi-dimensional comparison
- **Scatter Plots**: Correlation analysis
- **Area Bump Charts**: Ranking changes over time

## Usage for AI Agents

### Basic Chart Configuration

```typescript
// Example: Configure a bar chart
await configureChart({
  chartType: 'bar',
  title: 'Sales by Product Category',
  dataMapping: {
    indexBy: 'category',
    valueColumns: ['sales', 'profit']
  },
  // Additional chart properties...
});
```

### Data Mapping Guidelines

- **indexBy**: Column for categories (x-axis for bar charts)
- **valueColumns**: Numeric columns for values (y-axis for bar charts)
- **xColumn/yColumns**: For line charts (x-axis and multiple y-series)
- **valueColumn**: Single value column for pie charts

### Best Practices

1. **Always specify data mapping** that matches your CSV structure
2. **Use descriptive column names** that clearly indicate data meaning
3. **Configure appropriate chart properties** for optimal visualization
4. **Validate column existence** in your CSV before mapping

## Integration Points

### Prompts Updated
- `regularPrompt`: Added guidance for using chart configuration tools
- `chartPrompt`: Enhanced with data mapping instructions
- `updateDocumentPrompt`: Includes chart configuration tool usage

### API Routes Updated
- Added `configureChart` tool to active tools list
- Integrated tool into chat route handlers

### UI Components Updated  
- `message.tsx`: Added support for displaying chart configuration results
- Chart configuration tool results show chart type and mapped columns

## Data Flow

1. **Agent receives request** for data visualization
2. **Agent reads CSV data** using `readCsvFile` tool
3. **Agent configures chart** using `configureChart` tool with proper data mapping
4. **System processes data** using ChartDataProcessor based on configuration
5. **Chart renders** with Nivo using processed data

## Tool Interface

The `configureChart` tool accepts:
- Chart type and configuration properties
- Data mapping specifications (which CSV columns to use)
- Styling and display options

Returns:
- Validated chart configuration
- Success/error status
- Data mapping validation results

This system ensures agents can create sophisticated visualizations while maintaining data integrity and providing clear separation of responsibilities.
