import React, { useState, useEffect } from 'react';
import { NodeDialog, SettingsObject, DataTableSpec } from '../core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export class DataInputNodeDialog extends NodeDialog {
  private static CSV_URL_KEY = 'csv_url';
  private csvUrl: string = '';

  createDialogPanel(settings: SettingsObject, specs: DataTableSpec[]): React.ReactElement {
    // Make sure we load current settings first
    this.loadSettings(settings, specs);
    
    return React.createElement(DataInputDialogPanel, {
      settings,
      specs,
      initialUrl: this.csvUrl,
      onUrlChange: (url: string) => {
        this.csvUrl = url;
        settings.set(DataInputNodeDialog.CSV_URL_KEY, url);
      }
    });
  }

  loadSettings(settings: SettingsObject, specs: DataTableSpec[]): void {
    this.csvUrl = settings.getString ? 
      settings.getString(DataInputNodeDialog.CSV_URL_KEY, '') :
      (settings as any)[DataInputNodeDialog.CSV_URL_KEY] || '';
  }

  saveSettings(settings: SettingsObject): void {
    if (settings.set) {
      settings.set(DataInputNodeDialog.CSV_URL_KEY, this.csvUrl);
    } else {
      (settings as any)[DataInputNodeDialog.CSV_URL_KEY] = this.csvUrl;
    }
  }
}

interface DataInputDialogPanelProps {
  settings: SettingsObject;
  specs: DataTableSpec[];
  initialUrl: string;
  onUrlChange: (url: string) => void;
}

function DataInputDialogPanel(props: DataInputDialogPanelProps) {
  const [url, setUrl] = useState(props.initialUrl);

  // Update local state when initial URL changes (e.g., when dialog is reopened)
  useEffect(() => {
    setUrl(props.initialUrl);
  }, [props.initialUrl]);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    props.onUrlChange(newUrl);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Data Input Configuration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Load CSV data from a URL source.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="csv-url">CSV URL</Label>
        <Input
          id="csv-url"
          type="url"
          placeholder="https://example.com/data.csv"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Enter the URL of a CSV file to load data from.
        </p>
      </div>
      
      {url && (
        <div className="p-2 bg-muted rounded text-sm">
          <strong>URL:</strong> {url}
        </div>
      )}
    </div>
  );
} 