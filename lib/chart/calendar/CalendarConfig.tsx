import React from 'react';
import type { CalendarChartConfig } from './CalendarSchema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CalendarConfigProps {
  config: CalendarChartConfig;
  onChange: (updates: Partial<CalendarChartConfig>) => void;
}

export function CalendarConfig({ config, onChange }: CalendarConfigProps) {
  const updateDataMapping = (field: string, value: string) => {
    onChange({
      dataMapping: {
        ...config.dataMapping,
        [field]: value,
      },
    });
  };

  const updateMargin = (side: string, value: number) => {
    onChange({
      margin: {
        ...config.margin,
        [side]: value,
      },
    });
  };

  const updateTooltip = (field: string, value: any) => {
    onChange({
      tooltip: {
        ...config.tooltip,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Chart title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={config.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Chart description"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={config.width}
                onChange={(e) => onChange({ width: Number.parseInt(e.target.value) || 800 })}
                min="200"
                max="2000"
              />
            </div>
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={config.height}
                onChange={(e) => onChange({ height: Number.parseInt(e.target.value) || 600 })}
                min="200"
                max="1500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select value={config.theme} onValueChange={(value: 'light' | 'dark' | 'custom') => onChange({ theme: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Mapping */}
      <Card>
        <CardHeader>
          <CardTitle>Data Mapping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dateColumn">Date Column</Label>
            <Input
              id="dateColumn"
              value={config.dataMapping.dateColumn}
              onChange={(e) => updateDataMapping('dateColumn', e.target.value)}
              placeholder="Column containing dates"
            />
          </div>
          <div>
            <Label htmlFor="valueColumn">Value Column</Label>
            <Input
              id="valueColumn"
              value={config.dataMapping.valueColumn}
              onChange={(e) => updateDataMapping('valueColumn', e.target.value)}
              placeholder="Column containing values"
            />
          </div>
        </CardContent>
      </Card>

      {/* Date Range */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from">From Date (YYYY-MM-DD)</Label>
              <Input
                id="from"
                type="date"
                value={config.from || ''}
                onChange={(e) => onChange({ from: e.target.value || undefined })}
              />
            </div>
            <div>
              <Label htmlFor="to">To Date (YYYY-MM-DD)</Label>
              <Input
                id="to"
                type="date"
                value={config.to || ''}
                onChange={(e) => onChange({ to: e.target.value || undefined })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors and Values */}
      <Card>
        <CardHeader>
          <CardTitle>Colors and Values</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emptyColor">Empty Color</Label>
            <Input
              id="emptyColor"
              type="color"
              value={config.emptyColor}
              onChange={(e) => onChange({ emptyColor: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minValue">Min Value</Label>
              <Input
                id="minValue"
                type="number"
                value={config.minValue === 'auto' ? '' : config.minValue}
                onChange={(e) => onChange({ 
                  minValue: e.target.value === '' ? 'auto' : Number.parseFloat(e.target.value) 
                })}
                placeholder="auto"
              />
            </div>
            <div>
              <Label htmlFor="maxValue">Max Value</Label>
              <Input
                id="maxValue"
                type="number"
                value={config.maxValue === 'auto' ? '' : config.maxValue}
                onChange={(e) => onChange({ 
                  maxValue: e.target.value === '' ? 'auto' : Number.parseFloat(e.target.value) 
                })}
                placeholder="auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="direction">Direction</Label>
            <Select value={config.direction} onValueChange={(value: 'horizontal' | 'vertical') => onChange({ direction: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Year Spacing: {config.yearSpacing}</Label>
            <Slider
              value={[config.yearSpacing]}
              onValueChange={([value]) => onChange({ yearSpacing: value })}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Day Spacing: {config.daySpacing}</Label>
            <Slider
              value={[config.daySpacing]}
              onValueChange={([value]) => onChange({ daySpacing: value })}
              min={0}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Month Styling */}
      <Card>
        <CardHeader>
          <CardTitle>Month Styling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Month Border Width: {config.monthBorderWidth}</Label>
            <Slider
              value={[config.monthBorderWidth]}
              onValueChange={([value]) => onChange({ monthBorderWidth: value })}
              min={0}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="monthBorderColor">Month Border Color</Label>
            <Input
              id="monthBorderColor"
              type="color"
              value={config.monthBorderColor}
              onChange={(e) => onChange({ monthBorderColor: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="monthLegendPosition">Month Legend Position</Label>
            <Select value={config.monthLegendPosition} onValueChange={(value: 'before' | 'after') => onChange({ monthLegendPosition: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Before</SelectItem>
                <SelectItem value="after">After</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Month Legend Offset: {config.monthLegendOffset}</Label>
            <Slider
              value={[config.monthLegendOffset]}
              onValueChange={([value]) => onChange({ monthLegendOffset: value })}
              min={-50}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Day Styling */}
      <Card>
        <CardHeader>
          <CardTitle>Day Styling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Day Border Width: {config.dayBorderWidth}</Label>
            <Slider
              value={[config.dayBorderWidth]}
              onValueChange={([value]) => onChange({ dayBorderWidth: value })}
              min={0}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="dayBorderColor">Day Border Color</Label>
            <Input
              id="dayBorderColor"
              type="color"
              value={config.dayBorderColor}
              onChange={(e) => onChange({ dayBorderColor: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Year Styling */}
      <Card>
        <CardHeader>
          <CardTitle>Year Styling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="yearLegendPosition">Year Legend Position</Label>
            <Select value={config.yearLegendPosition} onValueChange={(value: 'before' | 'after') => onChange({ yearLegendPosition: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Before</SelectItem>
                <SelectItem value="after">After</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Year Legend Offset: {config.yearLegendOffset}</Label>
            <Slider
              value={[config.yearLegendOffset]}
              onValueChange={([value]) => onChange({ yearLegendOffset: value })}
              min={-50}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tooltip */}
      <Card>
        <CardHeader>
          <CardTitle>Tooltip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="tooltipEnabled"
              checked={config.tooltip.enabled}
              onCheckedChange={(checked) => updateTooltip('enabled', checked)}
            />
            <Label htmlFor="tooltipEnabled">Enable Tooltip</Label>
          </div>

          {config.tooltip.enabled && (
            <div>
              <Label htmlFor="tooltipFormat">Tooltip Format</Label>
              <Input
                id="tooltipFormat"
                value={config.tooltip.format || ''}
                onChange={(e) => updateTooltip('format', e.target.value || undefined)}
                placeholder="Custom format (optional)"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Margins */}
      <Card>
        <CardHeader>
          <CardTitle>Margins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Top: {config.margin.top}</Label>
              <Slider
                value={[config.margin.top]}
                onValueChange={([value]) => updateMargin('top', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Right: {config.margin.right}</Label>
              <Slider
                value={[config.margin.right]}
                onValueChange={([value]) => updateMargin('right', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Bottom: {config.margin.bottom}</Label>
              <Slider
                value={[config.margin.bottom]}
                onValueChange={([value]) => updateMargin('bottom', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Left: {config.margin.left}</Label>
              <Slider
                value={[config.margin.left]}
                onValueChange={([value]) => updateMargin('left', value)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 