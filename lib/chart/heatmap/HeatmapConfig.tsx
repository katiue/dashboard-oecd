import React from 'react';
import type { HeatmapChartConfig } from './HeatmapSchema';

interface HeatmapConfigProps {
  config: HeatmapChartConfig;
  onChange: (updates: Partial<HeatmapChartConfig>) => void;
}

export const HeatmapConfig: React.FC<HeatmapConfigProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Heatmap Configuration</h4>
      
      {/* Basic Properties */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.forceSquare || false}
            onChange={(e) => onChange({ forceSquare: e.target.checked })}
          />
          <label className="text-sm">Force Square Cells</label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.enableLabels !== false}
            onChange={(e) => onChange({ enableLabels: e.target.checked })}
          />
          <label className="text-sm">Enable Labels</label>
        </div>
      </div>

      {/* Cell Properties */}
      <div>
        <h5 className="font-medium mb-2">Cell Properties</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Cell Opacity ({config.cellOpacity || 1})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.cellOpacity || 1}
              onChange={(e) => onChange({ cellOpacity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm">Border Width ({config.cellBorderWidth || 0})</label>
            <input
              type="range"
              min="0"
              max="10"
              value={config.cellBorderWidth || 0}
              onChange={(e) => onChange({ cellBorderWidth: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="text-sm">Border Color</label>
          <input
            type="color"
            className="w-full mt-1 p-1 border rounded"
            value={typeof config.cellBorderColor === 'string' ? config.cellBorderColor : '#000000'}
            onChange={(e) => onChange({ cellBorderColor: e.target.value })}
          />
        </div>
      </div>

      {/* Color Scale */}
      <div>
        <h5 className="font-medium mb-2">Color Scale</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Color Scheme</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.colorScale?.scheme || 'blues'}
              onChange={(e) => onChange({ 
                colorScale: { 
                  type: 'quantize',
                  ...config.colorScale, 
                  scheme: e.target.value as any 
                }
              })}
            >
              <option value="blues">Blues</option>
              <option value="greens">Greens</option>
              <option value="reds">Reds</option>
              <option value="oranges">Oranges</option>
              <option value="purples">Purples</option>
              <option value="viridis">Viridis</option>
              <option value="plasma">Plasma</option>
              <option value="inferno">Inferno</option>
              <option value="magma">Magma</option>
              <option value="cividis">Cividis</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Scale Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.colorScale?.type || 'quantize'}
              onChange={(e) => onChange({ 
                colorScale: { 
                  ...config.colorScale, 
                  type: e.target.value as any 
                }
              })}
            >
              <option value="quantize">Quantize</option>
              <option value="linear">Linear</option>
              <option value="symlog">Symlog</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="text-sm">Min Value</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value={config.colorScale?.min === 'auto' ? 'auto' : config.colorScale?.min || ''}
              onChange={(e) => onChange({ 
                colorScale: { 
                  type: 'quantize',
                  ...config.colorScale, 
                  min: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
                }
              })}
            />
          </div>
          <div>
            <label className="text-sm">Max Value</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value={config.colorScale?.max === 'auto' ? 'auto' : config.colorScale?.max || ''}
              onChange={(e) => onChange({ 
                colorScale: { 
                  type: 'quantize',
                  ...config.colorScale, 
                  max: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
                }
              })}
            />
          </div>
        </div>
      </div>

      {/* Axes */}
      <div>
        <h5 className="font-medium mb-2">Axes</h5>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisTop}
              onChange={(e) => onChange({ 
                axisTop: e.target.checked ? { legend: 'Top Axis' } : null 
              })}
            />
            <label className="text-xs">Top Axis</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisRight}
              onChange={(e) => onChange({ 
                axisRight: e.target.checked ? { legend: 'Right Axis' } : null 
              })}
            />
            <label className="text-xs">Right Axis</label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisBottom}
              onChange={(e) => onChange({ 
                axisBottom: e.target.checked ? { 
                  legend: config.dataMapping.xColumn,
                  tickRotation: -90 
                } : null 
              })}
            />
            <label className="text-xs">Bottom Axis</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisLeft}
              onChange={(e) => onChange({ 
                axisLeft: e.target.checked ? { 
                  legend: config.dataMapping.yColumn,
                  legendPosition: 'middle',
                  legendOffset: -40
                } : null 
              })}
            />
            <label className="text-xs">Left Axis</label>
          </div>
        </div>
      </div>
    </div>
  );
}; 