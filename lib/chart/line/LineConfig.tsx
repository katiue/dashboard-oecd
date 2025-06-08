import React from 'react';
import type { LineChartConfig } from './LineSchema';

interface LineConfigProps {
  config: LineChartConfig;
  onChange: (updates: Partial<LineChartConfig>) => void;
}

export const LineConfig: React.FC<LineConfigProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Line Chart Configuration</h4>
      
      {/* Curve and Line Properties */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Curve Type</label>
          <select
            className="w-full mt-1 p-2 border rounded"
            value={config.curve || 'linear'}
            onChange={(e) => onChange({ curve: e.target.value as any })}
          >
            <option value="basis">Basis</option>
            <option value="cardinal">Cardinal</option>
            <option value="catmullRom">Catmull Rom</option>
            <option value="linear">Linear</option>
            <option value="monotoneX">Monotone X</option>
            <option value="monotoneY">Monotone Y</option>
            <option value="natural">Natural</option>
            <option value="step">Step</option>
            <option value="stepAfter">Step After</option>
            <option value="stepBefore">Step Before</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Line Width ({config.lineWidth || 2})</label>
          <input
            type="range"
            min="1"
            max="10"
            value={config.lineWidth || 2}
            onChange={(e) => onChange({ lineWidth: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Points */}
      <div>
        <h5 className="font-medium mb-2">Points</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enablePoints !== false}
              onChange={(e) => onChange({ enablePoints: e.target.checked })}
            />
            <label className="text-sm">Enable Points</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enablePointLabel || false}
              onChange={(e) => onChange({ enablePointLabel: e.target.checked })}
            />
            <label className="text-sm">Enable Point Labels</label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="text-sm">Point Size ({config.pointSize || 8})</label>
            <input
              type="range"
              min="4"
              max="20"
              value={config.pointSize || 8}
              onChange={(e) => onChange({ pointSize: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm">Border Width ({config.pointBorderWidth || 2})</label>
            <input
              type="range"
              min="0"
              max="10"
              value={config.pointBorderWidth || 2}
              onChange={(e) => onChange({ pointBorderWidth: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Area Fill */}
      <div>
        <h5 className="font-medium mb-2">Area Fill</h5>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableArea || false}
              onChange={(e) => onChange({ enableArea: e.target.checked })}
            />
            <label className="text-sm">Enable Area</label>
          </div>
          <div>
            <label className="text-sm">Opacity ({config.areaOpacity || 0.2})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.areaOpacity || 0.2}
              onChange={(e) => onChange({ areaOpacity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Grid and Crosshair */}
      <div>
        <h5 className="font-medium mb-2">Grid & Crosshair</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableGridX !== false}
              onChange={(e) => onChange({ enableGridX: e.target.checked })}
            />
            <label className="text-sm">Enable Grid X</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableGridY !== false}
              onChange={(e) => onChange({ enableGridY: e.target.checked })}
            />
            <label className="text-sm">Enable Grid Y</label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableCrosshair || false}
              onChange={(e) => onChange({ enableCrosshair: e.target.checked })}
            />
            <label className="text-sm">Enable Crosshair</label>
          </div>
          <div>
            <label className="text-sm">Crosshair Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.crosshairType || 'cross'}
              onChange={(e) => onChange({ crosshairType: e.target.value as any })}
            >
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="top-left">Top Left</option>
              <option value="top">Top</option>
              <option value="top-right">Top Right</option>
              <option value="right">Right</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="x">X</option>
              <option value="y">Y</option>
              <option value="cross">Cross</option>
            </select>
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
    </div>
  );
}; 