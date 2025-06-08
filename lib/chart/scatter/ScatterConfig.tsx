// Scatter Plot Configuration Component
import React from 'react';
import { ScatterPlotConfig } from './ScatterSchema';

interface ScatterConfigProps {
  config: ScatterPlotConfig;
  onChange: (updates: Partial<ScatterPlotConfig>) => void;
}

export const ScatterConfig: React.FC<ScatterConfigProps> = ({ config, onChange }) => {
  const nodeSize = typeof config.nodeSize === 'number' ? config.nodeSize : 10;
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Scatter Plot Configuration</h4>
      
      {/* Node Configuration */}
      <div>
        <h5 className="font-medium mb-2">Node Properties</h5>
        <div>
          <label className="text-sm">Node Size ({nodeSize})</label>
          <input
            type="range"
            min="4"
            max="64"
            value={nodeSize}
            onChange={(e) => onChange({ nodeSize: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* X Scale */}
      <div>
        <h5 className="font-medium mb-2">X Scale</h5>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm">Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.xScale?.type || 'linear'}
              onChange={(e) => onChange({ 
                xScale: { 
                  type: e.target.value as 'linear' | 'log' | 'symlog' | 'time',
                  ...config.xScale 
                }
              })}
            >
              <option value="linear">Linear</option>
              <option value="log">Log</option>
              <option value="symlog">Symlog</option>
              <option value="time">Time</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Min</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value={config.xScale?.min === 'auto' ? 'auto' : config.xScale?.min || ''}
              onChange={(e) => onChange({ 
                xScale: { 
                  type: config.xScale?.type || 'linear',
                  ...config.xScale, 
                  min: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
                }
              })}
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="text-sm">Max</label>
          <input
            type="text"
            className="w-full mt-1 p-1 border rounded text-xs"
            placeholder="auto"
            value={config.xScale?.max === 'auto' ? 'auto' : config.xScale?.max || ''}
            onChange={(e) => onChange({ 
              xScale: { 
                type: config.xScale?.type || 'linear',
                ...config.xScale, 
                max: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
              }
            })}
          />
        </div>
      </div>

      {/* Y Scale */}
      <div>
        <h5 className="font-medium mb-2">Y Scale</h5>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm">Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.yScale?.type || 'linear'}
              onChange={(e) => onChange({ 
                yScale: { 
                  type: e.target.value as 'linear' | 'log' | 'symlog' | 'time',
                  ...config.yScale 
                }
              })}
            >
              <option value="linear">Linear</option>
              <option value="log">Log</option>
              <option value="symlog">Symlog</option>
              <option value="time">Time</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Min</label>
            <input
              type="text"
              className="w-full mt-1 p-1 border rounded text-xs"
              placeholder="auto"
              value={config.yScale?.min === 'auto' ? 'auto' : config.yScale?.min || ''}
              onChange={(e) => onChange({ 
                yScale: { 
                  type: config.yScale?.type || 'linear',
                  ...config.yScale, 
                  min: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
                }
              })}
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="text-sm">Max</label>
          <input
            type="text"
            className="w-full mt-1 p-1 border rounded text-xs"
            placeholder="auto"
            value={config.yScale?.max === 'auto' ? 'auto' : config.yScale?.max || ''}
            onChange={(e) => onChange({ 
              yScale: { 
                type: config.yScale?.type || 'linear',
                ...config.yScale, 
                max: e.target.value === 'auto' ? 'auto' : (e.target.value ? Number(e.target.value) : 'auto')
              }
            })}
          />
        </div>
      </div>

      {/* Grid and Mesh */}
      <div>
        <h5 className="font-medium mb-2">Grid & Mesh</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableGridX || false}
              onChange={(e) => onChange({ enableGridX: e.target.checked })}
            />
            <label className="text-sm">Enable Grid X</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableGridY || false}
              onChange={(e) => onChange({ enableGridY: e.target.checked })}
            />
            <label className="text-sm">Enable Grid Y</label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.useMesh || false}
              onChange={(e) => onChange({ useMesh: e.target.checked })}
            />
            <label className="text-sm">Use Mesh</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.debugMesh || false}
              onChange={(e) => onChange({ debugMesh: e.target.checked })}
            />
            <label className="text-sm">Debug Mesh</label>
          </div>
        </div>
      </div>

      {/* Axes Configuration */}
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
                axisBottom: e.target.checked ? { legend: 'X Axis' } : null 
              })}
            />
            <label className="text-xs">Bottom Axis</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!config.axisLeft}
              onChange={(e) => onChange({ 
                axisLeft: e.target.checked ? { legend: 'Y Axis' } : null 
              })}
            />
            <label className="text-xs">Left Axis</label>
          </div>
        </div>
      </div>

      {/* Legends */}
      <div>
        <h5 className="font-medium mb-2">Legends</h5>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={!!(config.legends && config.legends.length > 0)}
            onChange={(e) => onChange({ 
              legends: e.target.checked ? [{
                anchor: 'bottom-right',
                direction: 'column',
                translateX: 100,
                translateY: 0,
                itemWidth: 100,
                itemHeight: 18,
                symbolSize: 12
              }] : []
            })}
          />
          <label className="text-sm">Enable Legends</label>
        </div>
      </div>
    </div>
  );
}; 