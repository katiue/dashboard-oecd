// Base Chart Configuration Schemas
// Shared interfaces that all chart types extend

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

// Data transformation instructions for the agent
export interface DataTransformInstruction {
  chartType: string;
  mapping: Record<string, string>; // Maps chart data fields to CSV column names
  description: string;
} 