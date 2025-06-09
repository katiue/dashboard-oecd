import React from 'react';
import type { LineChartConfig } from './LineSchema';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface LineConfigProps {
  config: LineChartConfig;
  onChange: (updates: Partial<LineChartConfig>) => void;
}

export const LineConfig: React.FC<LineConfigProps> = ({ config, onChange }) => {
  return (
    <Card className="bg-card p-4">
      <div className="space-y-4">
        <h4 className="font-medium">Line Chart Configuration</h4>

        {/* Curve and Line Properties */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Curve Type</Label>
            <Select value={config.curve || "linear"} onValueChange={(value) => onChange({ curve: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basis">Basis</SelectItem>
                <SelectItem value="cardinal">Cardinal</SelectItem>
                <SelectItem value="catmullRom">Catmull Rom</SelectItem>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="monotoneX">Monotone X</SelectItem>
                <SelectItem value="monotoneY">Monotone Y</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
                <SelectItem value="step">Step</SelectItem>
                <SelectItem value="stepAfter">Step After</SelectItem>
                <SelectItem value="stepBefore">Step Before</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Line Width ({config.lineWidth || 2})</Label>
            <Slider
              value={[config.lineWidth || 2]}
              onValueChange={(value) => onChange({ lineWidth: value[0] })}
              min={1}
              max={10}
            />
          </div>
        </div>

        {/* X Scale */}
        <div className="space-y-4">
          <h5 className="font-medium">X Scale</h5>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={config.xScale?.type || "point"}
                onValueChange={(value) =>
                  onChange({
                    xScale: {
                      type: value as "point" | "linear" | "time",
                      ...config.xScale,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="point">Point</SelectItem>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Min</Label>
              <Input placeholder="auto" value="auto" disabled />
            </div>
            <div className="space-y-2">
              <Label>Max</Label>
              <Input placeholder="auto" value="auto" disabled />
            </div>
          </div>
        </div>

        {/* Y Scale */}
        <div className="space-y-4">
          <h5 className="font-medium">Y Scale</h5>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={config.yScale?.type || "linear"}
                onValueChange={(value) =>
                  onChange({
                    yScale: {
                      type: value as "linear" | "symlog",
                      ...config.yScale,
                    },
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
                value={config.yScale?.min === "auto" ? "auto" : config.yScale?.min || ""}
                onChange={(e) =>
                  onChange({
                    yScale: {
                      type: config.yScale?.type || "linear",
                      ...config.yScale,
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
                value={config.yScale?.max === "auto" ? "auto" : config.yScale?.max || ""}
                onChange={(e) =>
                  onChange({
                    yScale: {
                      type: config.yScale?.type || "linear",
                      ...config.yScale,
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
                checked={config.yScale?.stacked || false}
                onCheckedChange={(checked) =>
                  onChange({
                    yScale: {
                      type: config.yScale?.type || "linear",
                      ...config.yScale,
                      stacked: checked,
                    },
                  })
                }
              />
              <Label>Stacked</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.yScale?.reverse || false}
                onCheckedChange={(checked) =>
                  onChange({
                    yScale: {
                      type: config.yScale?.type || "linear",
                      ...config.yScale,
                      reverse: checked,
                    },
                  })
                }
              />
              <Label>Reverse</Label>
            </div>
          </div>
        </div>

        {/* Points */}
        <div className="space-y-4">
          <h5 className="font-medium">Points</h5>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.enablePoints || false}
                onCheckedChange={(checked) => onChange({ enablePoints: checked })}
              />
              <Label>Enable Points</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.enablePointLabel || false}
                onCheckedChange={(checked) => onChange({ enablePointLabel: checked })}
              />
              <Label>Enable Point Labels</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Size ({config.pointSize || 8})</Label>
              <Slider
                value={[config.pointSize || 8]}
                onValueChange={(value) => onChange({ pointSize: value[0] })}
                min={4}
                max={20}
              />
            </div>
            <div className="space-y-2">
              <Label>Border Width</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={config.pointBorderWidth || 0}
                onChange={(e) => onChange({ pointBorderWidth: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">  
            <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={config.pointColor || "#ffffff"}
                  onChange={(e) => onChange({ pointColor: e.target.value })}
                />
            </div>
            <div className="space-y-2">
              <Label>Border Color</Label>
              <Input
                type="color"
                value={config.pointBorderColor || "#000000"}
                onChange={(e) => onChange({ pointBorderColor: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Point Label</Label>
              <Input value={config.pointLabel || ""} onChange={(e) => onChange({ pointLabel: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Label Y Offset</Label>
              <Input
                type="number"
                value={config.pointLabelYOffset || 0}
                onChange={(e) => onChange({ pointLabelYOffset: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Areas */}
        <div className="space-y-4">
          <h5 className="font-medium">Area Fill</h5>
          
          <div className="space-y-2">
            <Label>Opacity ({config.areaOpacity || 0.2})</Label>
            <Slider
              value={[config.areaOpacity || 0.2]}
              onValueChange={(value) => onChange({ areaOpacity: value[0] })}
              min={0}
              max={1}
              step={0.1}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.enableArea || false}
                onCheckedChange={(checked) => onChange({ enableArea: checked })}
              />
              <Label>Enable Area</Label>
            </div>
            <div className="space-y-2">
              <Label>Baseline Value</Label>
              <Input type="number" value={0} disabled />
            </div>
          </div>
        </div>

        {/* Grid and Crosshair */}
        <div className="space-y-4">
          <h5 className="font-medium">Grid & Crosshair</h5>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.enableCrosshair || false}
                onCheckedChange={(checked) => onChange({ enableCrosshair: checked })}
              />
              <Label>Enable Crosshair</Label>
            </div>
            <div className="space-y-2">
              <Label>Crosshair Type</Label>
              <Select
                value={config.crosshairType || "cross"}
                onValueChange={(value) => onChange({ crosshairType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="x">X</SelectItem>
                  <SelectItem value="y">Y</SelectItem>
                  <SelectItem value="cross">Cross</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Axes */}
        <div className="space-y-4">
          <h5 className="font-medium">Axes</h5>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={!!config.axisBottom}
                onCheckedChange={(checked) =>
                  onChange({
                    axisBottom: checked ? { legend: "X Axis" } : null,
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
                    axisLeft: checked ? { legend: "Y Axis" } : null,
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