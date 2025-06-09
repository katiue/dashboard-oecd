import React from 'react';
import type { RadarChartConfig } from './RadarSchema';

interface RadarConfigProps {
  config: RadarChartConfig;
  onChange: (updates: Partial<RadarChartConfig>) => void;
}

export const RadarConfig: React.FC<RadarConfigProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Radar Chart Configuration</h4>
      
      {/* Basic Properties */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="radar-max-value" className="text-sm font-medium">Max Value</label>
          <input
            id="radar-max-value"
            type="text"
            className="w-full mt-1 p-2 border rounded"
            placeholder="auto"
            value={config.maxValue === 'auto' ? 'auto' : config.maxValue || ''}
            onChange={(e) => onChange({ 
              maxValue: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
            })}
          />
        </div>
        <div>
          <label htmlFor="radar-curve-type" className="text-sm font-medium">Curve Type</label>
          <select
            id="radar-curve-type"
            className="w-full mt-1 p-2 border rounded"
            value={config.curve || 'linearClosed'}
            onChange={(e) => onChange({ curve: e.target.value as any })}
          >
            <option value="linearClosed">Linear Closed</option>
            <option value="basisClosed">Basis Closed</option>
            <option value="cardinalClosed">Cardinal Closed</option>
            <option value="catmullRomClosed">Catmull Rom Closed</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div>
        <h5 className="font-medium mb-2">Grid</h5>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="radar-grid-levels" className="text-sm">Grid Levels ({config.gridLevels || 5})</label>
            <input
              id="radar-grid-levels"
              type="range"
              min="3"
              max="8"
              value={config.gridLevels || 5}
              onChange={(e) => onChange({ gridLevels: Number.parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="radar-grid-shape" className="text-sm">Grid Shape</label>
            <select
              id="radar-grid-shape"
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.gridShape || 'circular'}
              onChange={(e) => onChange({ gridShape: e.target.value as 'circular' | 'linear' })}
            >
              <option value="circular">Circular</option>
              <option value="linear">Linear</option>
            </select>
          </div>
          <div>
            <label htmlFor="radar-grid-label-offset" className="text-sm">Label Offset ({config.gridLabelOffset || 16})</label>
            <input
              id="radar-grid-label-offset"
              type="range"
              min="6"
              max="60"
              value={config.gridLabelOffset || 16}
              onChange={(e) => onChange({ gridLabelOffset: Number.parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Dots */}
      <div>
        <h5 className="font-medium mb-2">Dots</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              id="radar-enable-dots"
              type="checkbox"
              checked={config.enableDots !== false}
              onChange={(e) => onChange({ enableDots: e.target.checked })}
            />
            <label htmlFor="radar-enable-dots" className="text-sm">Enable Dots</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="radar-enable-dot-label"
              type="checkbox"
              checked={config.enableDotLabel || false}
              onChange={(e) => onChange({ enableDotLabel: e.target.checked })}
            />
            <label htmlFor="radar-enable-dot-label" className="text-sm">Enable Dot Labels</label>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div>
            <label htmlFor="radar-dot-size" className="text-sm">Size ({config.dotSize || 6})</label>
            <input
              id="radar-dot-size"
              type="range"
              min="4"
              max="32"
              value={config.dotSize || 6}
              onChange={(e) => onChange({ dotSize: Number.parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="radar-dot-color" className="text-sm">Color</label>
            <input
              id="radar-dot-color"
              type="color"
              className="w-full mt-1 p-1 border rounded"
              value={typeof config.dotColor === 'string' ? config.dotColor : '#ffffff'}
              onChange={(e) => onChange({ dotColor: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="radar-dot-border-width" className="text-sm">Border Width</label>
            <input
              id="radar-dot-border-width"
              type="range"
              min="0"
              max="10"
              value={config.dotBorderWidth || 2}
              onChange={(e) => onChange({ dotBorderWidth: Number.parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="radar-dot-border-color" className="text-sm">Border Color</label>
            <input
              id="radar-dot-border-color"
              type="color"
              className="w-full mt-1 p-1 border rounded"
              value={typeof config.dotBorderColor === 'string' ? config.dotBorderColor : '#000000'}
              onChange={(e) => onChange({ dotBorderColor: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Fill and Blend */}
      <div>
        <h5 className="font-medium mb-2">Fill & Blend</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="radar-fill-opacity" className="text-sm">Fill Opacity ({config.fillOpacity || 0.25})</label>
            <input
              id="radar-fill-opacity"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.fillOpacity || 0.25}
              onChange={(e) => onChange({ fillOpacity: Number.parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="radar-blend-mode" className="text-sm">Blend Mode</label>
            <select
              id="radar-blend-mode"
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.blendMode || 'normal'}
              onChange={(e) => onChange({ blendMode: e.target.value as any })}
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="darken">Darken</option>
              <option value="lighten">Lighten</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legends */}
      <div>
        <h5 className="font-medium mb-2">Legends</h5>
        <div className="flex items-center space-x-2">
          <input
            id="radar-enable-legends"
            type="checkbox"
            checked={!!(config.legends && config.legends.length > 0)}
            onChange={(e) => onChange({ 
              legends: e.target.checked ? [{
                anchor: 'top-left',
                direction: 'column',
                translateX: -50,
                translateY: -40,
                itemWidth: 80,
                itemHeight: 20,
                symbolSize: 12
              }] : []
            })}
          />
          <label htmlFor="radar-enable-legends" className="text-sm">Enable Legends</label>
        </div>
      </div>
    </div>
  );
}; 