import React from 'react';
import type { BarChartConfig } from './BarSchema';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';

interface BarConfigProps {
  config: BarChartConfig;
  onChange: (updates: Partial<BarChartConfig>) => void;
}

export const BarConfig: React.FC<BarConfigProps> = ({ config, onChange }) => {
  return (
    <Card className="bg-card p-4">
      <div className="space-y-4">
        <h4 className="font-medium">Bar Chart Configuration</h4>

        {/* Layout */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="layout">Layout</Label>
            <Select
              value={config.layout || "vertical"}
              onValueChange={(value) => onChange({ layout: value as "vertical" | "horizontal" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="groupMode">Group Mode</Label>
            <Select
              value={config.groupMode || "grouped"}
              onValueChange={(value) => onChange({ groupMode: value as "stacked" | "grouped" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grouped">Grouped</SelectItem>
                <SelectItem value="stacked">Stacked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Padding */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="padding">Padding ({config.padding || 0.3})</Label>
            <Slider
              value={[config.padding || 0.3]}
              onValueChange={(value) => onChange({ padding: value[0] })}
              min={0.1}
              max={0.9}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="innerPadding">Inner Padding ({config.innerPadding || 0})</Label>
            <Slider
              value={[config.innerPadding || 0]}
              onValueChange={(value) => onChange({ innerPadding: value[0] })}
              min={0}
              max={10}
              step={1}
            />
          </div>
        </div>

        {/* Value Scale */}
        <div className="space-y-4">
          <h5 className="font-medium">Value Scale</h5>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={config.valueScale?.type || "linear"}
                onValueChange={(value) =>
                  onChange({
                    valueScale: { ...config.valueScale, type: value as "linear" | "symlog" },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="symlog">Symlog</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Min</Label>
              <Input
                placeholder="auto"
                value={config.valueScale?.min === "auto" ? "auto" : config.valueScale?.min || ""}
                onChange={(e) =>
                  onChange({
                    valueScale: {
                      type: config.valueScale?.type || "linear",
                      ...config.valueScale,
                      min: e.target.value === "auto" ? "auto" : e.target.value ? Number(e.target.value) : "auto",
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Max</Label>
              <Input
                placeholder="auto"
                value={config.valueScale?.max === "auto" ? "auto" : config.valueScale?.max || ""}
                onChange={(e) =>
                  onChange({
                    valueScale: {
                      type: config.valueScale?.type || "linear",
                      ...config.valueScale,
                      max: e.target.value === "auto" ? "auto" : e.target.value ? Number(e.target.value) : "auto",
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.valueScale?.stacked || false}
                onCheckedChange={(checked) =>
                  onChange({
                    valueScale: {
                      type: config.valueScale?.type || "linear",
                      ...config.valueScale,
                      stacked: checked,
                    },
                  })
                }
              />
              <Label>Stacked</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.valueScale?.reverse || false}
                onCheckedChange={(checked) =>
                  onChange({
                    valueScale: {
                      type: config.valueScale?.type || "linear",
                      ...config.valueScale,
                      reverse: checked,
                    },
                  })
                }
              />
              <Label>Reverse</Label>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="space-y-4">
          <h5 className="font-medium">Labels</h5>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.enableLabel || false}
                onCheckedChange={(checked) => onChange({ enableLabel: checked })}
              />
              <Label>Enable Labels</Label>
            </div>
            <div className="space-y-2">
              <Label>Label Type</Label>
              <Select
                value={config.label || "value"}
                onValueChange={(value) => onChange({ label: value as "value" | "formattedValue" | string })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="formattedValue">Formatted Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Skip Width</Label>
              <Input
                type="number"
                value={config.labelSkipWidth || 0}
                onChange={(e) => onChange({ labelSkipWidth: Number.parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Skip Height</Label>
              <Input
                type="number"
                value={config.labelSkipHeight || 0}
                onChange={(e) => onChange({ labelSkipHeight: Number.parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <Input
                type="color"
                value={config.labelTextColor || "#000000"}
                onChange={(e) => onChange({ labelTextColor: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="space-y-4">
          <h5 className="font-medium">Grid</h5>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.enableGridX || false}
                onCheckedChange={(checked) => onChange({ enableGridX: checked })}
              />
              <Label>Enable Grid X</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.enableGridY || false}
                onCheckedChange={(checked) => onChange({ enableGridY: checked })}
              />
              <Label>Enable Grid Y</Label>
            </div>
          </div>
        </div>

        {/* Axes Configuration */}
        <div className="space-y-4">
          <h5 className="font-medium">Axes</h5>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={!!config.axisBottom}
                onCheckedChange={(checked) =>
                  onChange({
                    axisBottom: checked ? { legend: "Bottom Axis" } : null,
                  })
                }
              />
              <Label>Bottom Axis</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={!!config.axisLeft}
                onCheckedChange={(checked) =>
                  onChange({
                    axisLeft: checked ? { legend: "Left Axis" } : null,
                  })
                }
              />
              <Label>Left Axis</Label>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}; 