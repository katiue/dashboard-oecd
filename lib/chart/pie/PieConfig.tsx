import React from 'react';
import type { PieChartConfig } from './PieSchema';

interface PieConfigProps {
  config: PieChartConfig;
  onChange: (updates: Partial<PieChartConfig>) => void;
}

export const PieConfig: React.FC<PieConfigProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Pie Chart Configuration</h4>
      
      {/* Basic Properties */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Inner Radius ({config.innerRadius || 0.5})</label>
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.1"
            value={config.innerRadius || 0.5}
            onChange={(e) => onChange({ innerRadius: Number.parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">0 = full pie, 0.5 = donut</div>
        </div>
        <div>
          <label className="text-sm font-medium">Pad Angle ({config.padAngle || 0.7}°)</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={config.padAngle || 0.7}
            onChange={(e) => onChange({ padAngle: Number.parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Angles and Radius */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Corner Radius</label>
          <input
            type="range"
            min="0"
            max="10"
            value={config.cornerRadius || 3}
            onChange={(e) => onChange({ cornerRadius: Number.parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">{config.cornerRadius || 3}px</div>
        </div>
        <div>
          <label className="text-sm font-medium">Start Angle</label>
          <input
            type="range"
            min="0"
            max="360"
            value={config.startAngle || 0}
            onChange={(e) => onChange({ startAngle: Number.parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">{config.startAngle || 0}°</div>
        </div>
        <div>
          <label className="text-sm font-medium">End Angle</label>
          <input
            type="range"
            min="0"
            max="360"
            value={config.endAngle || 360}
            onChange={(e) => onChange({ endAngle: Number.parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">{config.endAngle || 360}°</div>
        </div>
      </div>

      {/* Sorting and Border */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.sortByValue || false}
            onChange={(e) => onChange({ sortByValue: e.target.checked })}
          />
          <label className="text-sm">Sort by Value</label>
        </div>
        <div>
          <label className="text-sm">Border Width</label>
          <input
            type="range"
            min="0"
            max="10"
            value={config.borderWidth || 1}
            onChange={(e) => onChange({ borderWidth: Number.parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">{config.borderWidth || 1}px</div>
        </div>
        <div>
          <label className="text-sm">Border Color</label>
          <input
            type="color"
            className="w-full mt-1 p-1 border rounded"
            value={typeof config.borderColor === 'string' ? config.borderColor : '#000000'}
            onChange={(e) => onChange({ borderColor: e.target.value })}
          />
        </div>
      </div>

      {/* Arc Labels */}
      <div>
        <h5 className="font-medium mb-2">Arc Labels (on slices)</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableArcLabels !== false}
              onChange={(e) => onChange({ enableArcLabels: e.target.checked })}
            />
            <label className="text-sm">Enable Arc Labels</label>
          </div>
          <div>
            <label className="text-sm">Arc Label Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.arcLabel || 'formattedValue'}
              onChange={(e) => onChange({ arcLabel: e.target.value as any })}
            >
              <option value="id">ID</option>
              <option value="value">Value</option>
              <option value="formattedValue">Formatted Value</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="text-sm">Skip Angle</label>
            <input
              type="range"
              min="0"
              max="45"
              value={config.arcLabelsSkipAngle || 10}
              onChange={(e) => onChange({ arcLabelsSkipAngle: Number.parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">{config.arcLabelsSkipAngle || 10}°</div>
          </div>
          <div>
            <label className="text-sm">Radius Offset</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={config.arcLabelsRadiusOffset || 0.4}
              onChange={(e) => onChange({ arcLabelsRadiusOffset: Number.parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">{config.arcLabelsRadiusOffset || 0.4}</div>
          </div>
        </div>
      </div>

      {/* Arc Link Labels */}
      <div>
        <h5 className="font-medium mb-2">Arc Link Labels (external)</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableArcLinkLabels !== false}
              onChange={(e) => onChange({ enableArcLinkLabels: e.target.checked })}
            />
            <label className="text-sm">Enable Link Labels</label>
          </div>
          <div>
            <label className="text-sm">Link Label Type</label>
            <select
              className="w-full mt-1 p-1 border rounded text-xs"
              value={config.arcLinkLabel || 'id'}
              onChange={(e) => onChange({ arcLinkLabel: e.target.value as any })}
            >
              <option value="id">ID</option>
              <option value="value">Value</option>
              <option value="formattedValue">Formatted Value</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div>
            <label className="text-xs">Skip Angle</label>
            <input
              type="range"
              min="0"
              max="45"
              value={config.arcLinkLabelsSkipAngle || 10}
              onChange={(e) => onChange({ arcLinkLabelsSkipAngle: Number.parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">{config.arcLinkLabelsSkipAngle || 10}°</div>
          </div>
          <div>
            <label className="text-xs">Thickness</label>
            <input
              type="range"
              min="1"
              max="10"
              value={config.arcLinkLabelsThickness || 2}
              onChange={(e) => onChange({ arcLinkLabelsThickness: Number.parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">{config.arcLinkLabelsThickness || 2}px</div>
          </div>
          <div>
            <label className="text-xs">Diagonal Length</label>
            <input
              type="range"
              min="0"
              max="36"
              value={config.arcLinkLabelsDiagonalLength || 16}
              onChange={(e) => onChange({ arcLinkLabelsDiagonalLength: Number.parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">{config.arcLinkLabelsDiagonalLength || 16}px</div>
          </div>
          <div>
            <label className="text-xs">Straight Length</label>
            <input
              type="range"
              min="0"
              max="36"
              value={config.arcLinkLabelsStraightLength || 24}
              onChange={(e) => onChange({ arcLinkLabelsStraightLength: Number.parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">{config.arcLinkLabelsStraightLength || 24}px</div>
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
                translateX: 0,
                translateY: 56,
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