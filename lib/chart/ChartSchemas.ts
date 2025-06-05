// Chart Configuration Schemas for Nivo Charts
// This file defines the structure and properties for each chart type
// The agent can modify chart properties but NOT the data directly
// Data manipulation should only be done through specific CSV tools

export interface BaseChartConfig {
  // Chart identification
  title: string;
  description?: string;
  
  // Layout and dimensions
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  
  // Theme and styling
  theme?: 'light' | 'dark' | 'custom';
  colors?: {
    scheme?: 'nivo' | 'category10' | 'accent' | 'dark2' | 'paired' | 'pastel1' | 'pastel2' | 'set1' | 'set2' | 'set3';
    customColors?: string[];
  };
  
  // Animation
  animate?: boolean;
  motionConfig?: 'default' | 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'molasses';
}

// BAR CHART CONFIGURATION
export interface BarChartConfig extends BaseChartConfig {
  chartType: 'bar';
  
  // Data mapping - Agent provides column mapping, tools generate actual data
  dataMapping: {
    indexBy: string; // Column name for categories (e.g., "product_name", "country")
    valueColumns: string[]; // Columns for numeric values (e.g., ["sales", "profit", "quantity"])
  };
  
  // Bar-specific properties
  layout?: 'vertical' | 'horizontal';
  groupMode?: 'stacked' | 'grouped';
  padding?: number; // 0.1 to 0.9
  innerPadding?: number; // 0 to 10
  
  // Scales
  valueScale?: {
    type: 'linear' | 'symlog';
    min?: number | 'auto';
    max?: number | 'auto';
    stacked?: boolean;
    reverse?: boolean;
  };
  
  // Axes
  axisTop?: AxisConfig | null;
  axisRight?: AxisConfig | null;
  axisBottom?: AxisConfig | null;
  axisLeft?: AxisConfig | null;
  
  // Labels
  enableLabel?: boolean;
  label?: string | 'value' | 'formattedValue';
  labelSkipWidth?: number;
  labelSkipHeight?: number;
  labelTextColor?: string;
  
  // Grid
  enableGridX?: boolean;
  enableGridY?: boolean;
  
  // Legends
  legends?: LegendConfig[];
}

// LINE CHART CONFIGURATION  
export interface LineChartConfig extends BaseChartConfig {
  chartType: 'line';
  
  // Data mapping - Each line series is a column
  dataMapping: {
    xColumn: string; // Column for X-axis (e.g., "date", "time", "month")
    yColumns: string[]; // Columns for Y values, each becomes a line (e.g., ["sales", "profit"])
  };
  
  // Line-specific properties
  curve?: 'basis' | 'cardinal' | 'catmullRom' | 'linear' | 'monotoneX' | 'monotoneY' | 'natural' | 'step' | 'stepAfter' | 'stepBefore';
  lineWidth?: number; // 1 to 10
  
  // Scales
  xScale?: {
    type: 'point' | 'linear' | 'time';
    min?: number | 'auto';
    max?: number | 'auto';
    stacked?: boolean;
    reverse?: boolean;
  };
  yScale?: {
    type: 'linear' | 'symlog';
    min?: number | 'auto';
    max?: number | 'auto';
    stacked?: boolean;
    reverse?: boolean;
  };
  
  // Points
  enablePoints?: boolean;
  pointSize?: number; // 4 to 20
  pointColor?: string;
  pointBorderWidth?: number;
  pointBorderColor?: string;
  enablePointLabel?: boolean;
  pointLabel?: string;
  pointLabelYOffset?: number;
  
  // Areas
  enableArea?: boolean;
  areaBaselineValue?: number;
  areaOpacity?: number; // 0 to 1
  
  // Axes
  axisTop?: AxisConfig | null;
  axisRight?: AxisConfig | null;
  axisBottom?: AxisConfig | null;
  axisLeft?: AxisConfig | null;
  
  // Grid
  enableGridX?: boolean;
  enableGridY?: boolean;
  
  // Crosshair
  enableCrosshair?: boolean;
  crosshairType?: 'bottom-left' | 'bottom' | 'left' | 'top-left' | 'top' | 'top-right' | 'right' | 'bottom-right' | 'x' | 'y' | 'cross';
  
  // Legends
  legends?: LegendConfig[];
}

// PIE CHART CONFIGURATION
export interface PieChartConfig extends BaseChartConfig {
  chartType: 'pie';
  
  // Data mapping - Simple id/value structure
  dataMapping: {
    idColumn: string; // Column for slice labels (e.g., "category", "product")
    valueColumn: string; // Column for slice values (e.g., "sales", "count")
  };
  
  // Pie-specific properties
  startAngle?: number; // 0 to 360
  endAngle?: number; // 0 to 360
  fit?: boolean;
  innerRadius?: number; // 0 to 0.95 (0 = pie, >0 = donut)
  padAngle?: number; // 0 to 45
  cornerRadius?: number; // 0 to 10
  
  // Sorting
  sortByValue?: boolean;
  
  // Arc labels
  enableArcLabels?: boolean;
  arcLabel?: 'id' | 'value' | 'formattedValue';
  arcLabelsSkipAngle?: number; // 0 to 45
  arcLabelsTextColor?: string;
  arcLabelsRadiusOffset?: number; // 0.5 to 2
  
  // Arc link labels  
  enableArcLinkLabels?: boolean;
  arcLinkLabel?: 'id' | 'value' | 'formattedValue';
  arcLinkLabelsSkipAngle?: number;
  arcLinkLabelsTextColor?: string;
  arcLinkLabelsThickness?: number; // 1 to 10
  arcLinkLabelsColor?: string;
  
  // Legends
  legends?: LegendConfig[];
}

// HEATMAP CONFIGURATION
export interface HeatmapConfig extends BaseChartConfig {
  chartType: 'heatmap';
  
  // Data mapping - Matrix structure
  dataMapping: {
    // Each row represents a data point with x, y coordinates and value
    xColumn: string; // Column for X-axis categories (e.g., "country", "product")
    yColumn: string; // Column for Y-axis categories (e.g., "month", "category") 
    valueColumn: string; // Column for cell values (e.g., "temperature", "sales")
  };
  
  // Heatmap-specific properties
  forceSquare?: boolean;
  sizeVariation?: number; // 0 to 1
  cellOpacity?: number; // 0 to 1
  cellBorderColor?: string;
  cellBorderWidth?: number; // 0 to 10
  cellShape?: 'rect' | 'circle';
  
  // Color scale
  colorScale?: {
    type: 'quantize' | 'linear' | 'symlog';
    scheme?: 'blues' | 'greens' | 'greys' | 'oranges' | 'purples' | 'reds' | 'viridis' | 'inferno' | 'magma' | 'plasma' | 'cividis' | 'warm' | 'cool' | 'cubehelix';
    colors?: string[];
    min?: number | 'auto';
    max?: number | 'auto';
  };
  
  // Labels
  enableLabels?: boolean;
  labelTextColor?: string;
  
  // Axes
  axisTop?: AxisConfig | null;
  axisRight?: AxisConfig | null;
  axisBottom?: AxisConfig | null;
  axisLeft?: AxisConfig | null;
  
  // Legends
  legends?: LegendConfig[];
}

// RADAR CHART CONFIGURATION
export interface RadarConfig extends BaseChartConfig {
  chartType: 'radar';
  
  // Data mapping - Multiple metrics per entity
  dataMapping: {
    indexBy: string; // Column for entity identifier (e.g., "player_name", "product")
    valueColumns: string[]; // Columns for different metrics (e.g., ["speed", "agility", "strength"])
  };
  
  // Radar-specific properties
  maxValue?: number | 'auto';
  curve?: 'linearClosed' | 'basisClosed' | 'cardinalClosed' | 'catmullRomClosed';
  
  // Grid
  gridLevels?: number; // 3 to 8
  gridShape?: 'circular' | 'linear';
  gridLabelOffset?: number; // 6 to 60
  
  // Dots
  enableDots?: boolean;
  dotSize?: number; // 4 to 32
  dotColor?: string;
  dotBorderWidth?: number; // 0 to 10
  dotBorderColor?: string;
  enableDotLabel?: boolean;
  dotLabel?: string;
  dotLabelYOffset?: number;
  
  // Fill
  fillOpacity?: number; // 0 to 1
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
  
  // Legends
  legends?: LegendConfig[];
}

// SCATTER PLOT CONFIGURATION
export interface ScatterPlotConfig extends BaseChartConfig {
  chartType: 'scatter';
  
  // Data mapping - X/Y coordinates with optional grouping
  dataMapping: {
    // Each series is a group of points
    seriesColumn?: string; // Optional column for grouping (e.g., "category", "species")
    xColumn: string; // Column for X values (e.g., "height", "price")
    yColumn: string; // Column for Y values (e.g., "weight", "rating")
    sizeColumn?: string; // Optional column for point size (e.g., "population", "sales")
  };
  
  // Scatter-specific properties
  nodeSize?: number | { from: number; to: number }; // 4 to 64 or dynamic range
  
  // Scales
  xScale?: {
    type: 'linear' | 'log' | 'symlog' | 'time';
    min?: number | 'auto';
    max?: number | 'auto';
  };
  yScale?: {
    type: 'linear' | 'log' | 'symlog' | 'time';  
    min?: number | 'auto';
    max?: number | 'auto';
  };
  
  // Axes
  axisTop?: AxisConfig | null;
  axisRight?: AxisConfig | null;
  axisBottom?: AxisConfig | null;
  axisLeft?: AxisConfig | null;
  
  // Grid
  enableGridX?: boolean;
  enableGridY?: boolean;
  
  // Mesh (for better hover detection)
  useMesh?: boolean;
  debugMesh?: boolean;
  
  // Legends
  legends?: LegendConfig[];
}

// AREA BUMP CONFIGURATION
export interface AreaBumpConfig extends BaseChartConfig {
  chartType: 'areaBump';
  
  // Data mapping - Time series with multiple categories
  dataMapping: {
    xColumn: string; // Column for time/sequence (e.g., "year", "month", "day")
    seriesColumns: string[]; // Columns representing different series (e.g., ["brand_a", "brand_b", "brand_c"])
  };
  
  // Area bump specific properties
  align?: 'start' | 'middle' | 'end';
  interpolation?: 'smooth' | 'linear';
  spacing?: number; // 0 to 32
  xPadding?: number; // 0 to 1
  
  // Start/End labels
  startLabel?: boolean;
  startLabelPadding?: number; // 0 to 32
  startLabelTextColor?: string;
  endLabel?: boolean;
  endLabelPadding?: number; // 0 to 32
  endLabelTextColor?: string;
  
  // Axes
  axisTop?: AxisConfig | null;
  axisBottom?: AxisConfig | null;
}

// SHARED INTERFACES
export interface AxisConfig {
  tickSize?: number; // 0 to 20
  tickPadding?: number; // 0 to 20
  tickRotation?: number; // -90 to 90
  legend?: string;
  legendPosition?: 'start' | 'middle' | 'end';
  legendOffset?: number; // -60 to 60
  truncateTickAt?: number; // 0 to 20
}

export interface LegendConfig {
  anchor: 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left' | 'top-left' | 'center';
  direction: 'row' | 'column';
  justify?: boolean;
  translateX?: number; // -200 to 200
  translateY?: number; // -200 to 200
  itemsSpacing?: number; // 0 to 60
  itemWidth?: number; // 10 to 200
  itemHeight?: number; // 10 to 200
  itemDirection?: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
  itemOpacity?: number; // 0 to 1
  symbolSize?: number; // 2 to 60
  symbolShape?: 'circle' | 'diamond' | 'square' | 'triangle';
}

// Union type for all chart configs
export type ChartConfig = 
  | BarChartConfig 
  | LineChartConfig 
  | PieChartConfig 
  | HeatmapConfig 
  | RadarConfig 
  | ScatterPlotConfig 
  | AreaBumpConfig;

// Data transformation instructions for the agent
export interface DataTransformInstruction {
  chartType: string;
  mapping: Record<string, string>; // Maps chart data fields to CSV column names
  description: string;
}

// Examples of data mapping instructions the agent can use:
export const DATA_MAPPING_EXAMPLES = {
  bar: {
    description: "For bar charts, specify which column contains categories (indexBy) and which columns contain numeric values (valueColumns)",
    example: {
      indexBy: "product_name", // Use the product name column for bar categories
      valueColumns: ["sales", "profit"] // Use sales and profit columns for bar heights
    }
  },
  line: {
    description: "For line charts, specify the X-axis column and which columns become separate lines",
    example: {
      xColumn: "month", // Use month column for X-axis
      yColumns: ["revenue", "expenses"] // Each column becomes a separate line
    }
  },
  pie: {
    description: "For pie charts, specify which column contains slice labels and which contains values",
    example: {
      idColumn: "category", // Use category column for slice labels
      valueColumn: "percentage" // Use percentage column for slice sizes
    }
  },
  heatmap: {
    description: "For heatmaps, specify X and Y category columns and the value column for color intensity",
    example: {
      xColumn: "country", // Use country for X-axis categories
      yColumn: "month", // Use month for Y-axis categories  
      valueColumn: "temperature" // Use temperature for cell color intensity
    }
  },
  radar: {
    description: "For radar charts, specify the entity identifier and metric columns",
    example: {
      indexBy: "player_name", // Use player name as entity identifier
      valueColumns: ["speed", "agility", "strength", "intelligence"] // Each metric becomes a radar axis
    }
  },
  scatter: {
    description: "For scatter plots, specify X and Y value columns, optionally group by series and size by another column",
    example: {
      xColumn: "height", // Use height for X-axis
      yColumn: "weight", // Use weight for Y-axis
      seriesColumn: "species", // Optional: group points by species
      sizeColumn: "age" // Optional: make point size represent age
    }
  },
  areaBump: {
    description: "For area bump charts, specify the time/sequence column and value columns for different areas",
    example: {
      xColumn: "year", // Use year for time progression
      seriesColumns: ["company_a", "company_b", "company_c"] // Each company becomes an area
    }
  }
};
