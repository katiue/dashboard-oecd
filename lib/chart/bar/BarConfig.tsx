import React from 'react';
import type { BarChartConfig } from './BarSchema';

interface BarConfigProps {
  config: BarChartConfig;
  onChange: (updates: Partial<BarChartConfig>) => void;
}

export const BarConfig: React.FC<BarConfigProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Bar Chart Configuration</h4>
      
      {/* Layout */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Layout</label>
          <select
            className="w-full mt-1 p-2 border rounded"
            value={config.layout || 'vertical'}
            onChange={(e) => onChange({ layout: e.target.value as 'vertical' | 'horizontal' })}
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Group Mode</label>
          <select
            className="w-full mt-1 p-2 border rounded"
            value={config.groupMode || 'grouped'}
            onChange={(e) => onChange({ groupMode: e.target.value as 'stacked' | 'grouped' })}
          >
            <option value="grouped">Grouped</option>
            <option value="stacked">Stacked</option>
          </select>
        </div>
      </div>

      {/* Padding */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Padding ({config.padding || 0.3})</label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={config.padding || 0.3}
            onChange={(e) => onChange({ padding: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Inner Padding ({config.innerPadding || 0})</label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={config.innerPadding || 0}
            onChange={(e) => onChange({ innerPadding: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Labels */}
      <div>
        <h5 className="font-medium mb-2">Labels</h5>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.enableLabel || false}
            onChange={(e) => onChange({ enableLabel: e.target.checked })}
          />
          <label className="text-sm">Enable Labels</label>
        </div>
      </div>

      {/* Grid */}
      <div>
        <h5 className="font-medium mb-2">Grid</h5>
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
      </div>
    </div>
  );
}; 