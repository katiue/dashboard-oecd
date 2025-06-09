import { z } from 'zod';

// Calendar-specific data mapping schema
export const CalendarDataMappingSchema = z.object({
  dateColumn: z.string().min(1, 'Date column is required'),
  valueColumn: z.string().min(1, 'Value column is required'),
});

// Calendar chart configuration schema
export const CalendarChartConfigSchema = z.object({
  chartType: z.literal('calendar'),
  title: z.string().default('Calendar Chart'),
  description: z.string().default(''),
  width: z.number().default(800),
  height: z.number().default(600),
  margin: z.object({
    top: z.number().default(40),
    right: z.number().default(40),
    bottom: z.number().default(40),
    left: z.number().default(40),
  }).default({}),
  theme: z.enum(['light', 'dark', 'custom']).default('light'),
  dataMapping: CalendarDataMappingSchema,
  
  // Calendar-specific styling options
  from: z.string().optional(),
  to: z.string().optional(),
  emptyColor: z.string().default('#eeeeee'),
  colors: z.array(z.string()).default(['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']),
  minValue: z.union([z.number(), z.literal('auto')]).default('auto'),
  maxValue: z.union([z.number(), z.literal('auto')]).default('auto'),
  
  // Month styling
  monthBorderWidth: z.number().min(0).default(2),
  monthBorderColor: z.string().default('#ffffff'),
  monthLegendPosition: z.enum(['before', 'after']).default('before'),
  monthLegendOffset: z.number().default(6),
  
  // Day styling
  dayBorderWidth: z.number().min(0).default(1),
  dayBorderColor: z.string().default('#ffffff'),
  daySpacing: z.number().min(0).default(0),
  
  // Year styling
  yearSpacing: z.number().min(0).default(30),
  yearLegendPosition: z.enum(['before', 'after']).default('before'),
  yearLegendOffset: z.number().default(10),
  
  // Direction
  direction: z.enum(['horizontal', 'vertical']).default('horizontal'),
  
  // Tooltip
  tooltip: z.object({
    enabled: z.boolean().default(true),
    format: z.string().optional(),
  }).default({}),
  
  // Legends
  legends: z.array(z.object({
    anchor: z.enum(['top', 'right', 'bottom', 'left', 'center']),
    direction: z.enum(['row', 'column']),
    justify: z.boolean().default(false),
    translateX: z.number().default(0),
    translateY: z.number().default(0),
    itemCount: z.number().default(4),
    itemsSpacing: z.number().default(0),
    itemWidth: z.number().default(0),
    itemHeight: z.number().default(0),
    itemDirection: z.enum(['left-to-right', 'right-to-left', 'top-to-bottom', 'bottom-to-top']).default('left-to-right'),
    itemOpacity: z.number().min(0).max(1).default(1),
    symbolSize: z.number().default(12),
    symbolShape: z.enum(['circle', 'diamond', 'square', 'triangle']).default('circle'),
  })).default([]),
});

// TypeScript types
export type CalendarDataMapping = z.infer<typeof CalendarDataMappingSchema>;
export type CalendarChartConfig = z.infer<typeof CalendarChartConfigSchema>;

// Default configuration
export const defaultCalendarConfig: CalendarChartConfig = {
  chartType: 'calendar',
  title: 'Calendar Chart',
  description: '',
  width: 800,
  height: 600,
  dataMapping: {
    dateColumn: '',
    valueColumn: '',
  },
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  theme: 'light',
  colors: ['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560'],
  emptyColor: '#eeeeee',
  minValue: 'auto',
  maxValue: 'auto',
  monthBorderWidth: 2,
  monthBorderColor: '#ffffff',
  monthLegendPosition: 'before',
  monthLegendOffset: 6,
  dayBorderWidth: 1,
  dayBorderColor: '#ffffff',
  daySpacing: 0,
  yearSpacing: 30,
  yearLegendPosition: 'before',
  yearLegendOffset: 10,
  direction: 'horizontal',
  tooltip: {
    enabled: true,
  },
  legends: [],
}; 