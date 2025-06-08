import React from 'react';
import { ResponsiveCalendar } from '@nivo/calendar';
import { CalendarChartConfig } from './CalendarSchema';
import { CalendarDataPoint } from './CalendarDataProcessor';

interface CalendarRendererProps {
  data: CalendarDataPoint[];
  config: CalendarChartConfig;
  theme?: any;
}

export function CalendarRenderer({ data, config, theme }: CalendarRendererProps) {
  // Determine date range from data if not specified
  const dates = data.map(d => new Date(d.day));
  const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date();
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date();

  // Format dates for Nivo Calendar (YYYY-MM-DD)
  const from = config.from || minDate.toISOString().split('T')[0];
  const to = config.to || maxDate.toISOString().split('T')[0];

  // Determine value range for color scaling
  const values = data.map(d => d.value);
  const minValue = config.minValue === 'auto' ? Math.min(...values) : config.minValue;
  const maxValue = config.maxValue === 'auto' ? Math.max(...values) : config.maxValue;

  return (
    <div style={{ width: config.width || 800, height: config.height || 600 }}>
      <ResponsiveCalendar
        data={data}
        from={from}
        to={to}
        emptyColor={config.emptyColor}
        colors={config.colors}
        minValue={minValue}
        maxValue={maxValue}
        margin={config.margin}
        
        // Month styling
        monthBorderWidth={config.monthBorderWidth}
        monthBorderColor={config.monthBorderColor}
        monthLegendPosition={config.monthLegendPosition}
        monthLegendOffset={config.monthLegendOffset}
        
        // Day styling
        dayBorderWidth={config.dayBorderWidth}
        dayBorderColor={config.dayBorderColor}
        daySpacing={config.daySpacing}
        
        // Year styling
        yearSpacing={config.yearSpacing}
        yearLegendPosition={config.yearLegendPosition}
        yearLegendOffset={config.yearLegendOffset}
        
        // Direction
        direction={config.direction}
        
        // Tooltip
        tooltip={config.tooltip.enabled ? undefined : () => null}
        
        // Legends
        legends={config.legends}
        
        // Theme
        theme={theme}
        
        // Remove unsupported accessibility props for now
      />
      
      {/* Accessibility labels */}
      {config.title && (
        <div id="calendar-title" style={{ position: 'absolute', left: '-9999px' }}>
          {config.title}
        </div>
      )}
      {config.description && (
        <div id="calendar-description" style={{ position: 'absolute', left: '-9999px' }}>
          {config.description}
        </div>
      )}
    </div>
  );
} 