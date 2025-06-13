import React, { useState, useEffect } from 'react';
import { NodeDialog, SettingsObject, DataTableSpec } from '../core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlusIcon, TrashIcon } from '@/components/icons';
import { PythonPortConfig } from './node-model';

export class PythonScriptNodeDialog extends NodeDialog {
  private static SCRIPT_CODE_KEY = 'script_code';
  private static INPUT_PORTS_KEY = 'input_ports';
  private static OUTPUT_PORTS_KEY = 'output_ports';
  private static LIBRARIES_KEY = 'libraries';

  private scriptCode: string = '';
  private inputPorts: PythonPortConfig[] = [];
  private outputPorts: PythonPortConfig[] = [];
  private libraries: string[] = [];

  createDialogPanel(settings: SettingsObject, specs: DataTableSpec[]): React.ReactElement {
    this.loadSettings(settings, specs);
    
    return React.createElement(PythonScriptDialogPanel, {
      settings,
      specs,
      initialValues: {
        scriptCode: this.scriptCode,
        inputPorts: this.inputPorts,
        outputPorts: this.outputPorts,
        libraries: this.libraries
      },
      onSettingsChange: (values) => {
        this.scriptCode = values.scriptCode;
        this.inputPorts = values.inputPorts;
        this.outputPorts = values.outputPorts;
        this.libraries = values.libraries;
      }
    });
  }

  loadSettings(settings: SettingsObject, specs: DataTableSpec[]): void {
    this.scriptCode = settings.getString?.(PythonScriptNodeDialog.SCRIPT_CODE_KEY, '') || '';
    
    const inputPortsJson = settings.getString?.(PythonScriptNodeDialog.INPUT_PORTS_KEY, '[]') || '[]';
    try {
      this.inputPorts = JSON.parse(inputPortsJson);
    } catch {
      this.inputPorts = [{ name: 'input_0', type: 'data', dataType: 'table', required: true }];
    }
    
    const outputPortsJson = settings.getString?.(PythonScriptNodeDialog.OUTPUT_PORTS_KEY, '[]') || '[]';
    try {
      this.outputPorts = JSON.parse(outputPortsJson);
    } catch {
      this.outputPorts = [{ name: 'output_0', type: 'data', dataType: 'table', required: true }];
    }
    
    const librariesJson = settings.getString?.(PythonScriptNodeDialog.LIBRARIES_KEY, '[]') || '[]';
    try {
      this.libraries = JSON.parse(librariesJson);
    } catch {
      this.libraries = ['pandas', 'numpy'];
    }
  }

  saveSettings(settings: SettingsObject): void {
    settings.set?.(PythonScriptNodeDialog.SCRIPT_CODE_KEY, this.scriptCode);
    settings.set?.(PythonScriptNodeDialog.INPUT_PORTS_KEY, JSON.stringify(this.inputPorts));
    settings.set?.(PythonScriptNodeDialog.OUTPUT_PORTS_KEY, JSON.stringify(this.outputPorts));
    settings.set?.(PythonScriptNodeDialog.LIBRARIES_KEY, JSON.stringify(this.libraries));
  }
}

interface PythonScriptDialogPanelProps {
  settings: SettingsObject;
  specs: DataTableSpec[];
  initialValues: {
    scriptCode: string;
    inputPorts: PythonPortConfig[];
    outputPorts: PythonPortConfig[];
    libraries: string[];
  };
  onSettingsChange: (values: any) => void;
}

function PythonScriptDialogPanel(props: PythonScriptDialogPanelProps) {
  const [scriptCode, setScriptCode] = useState(props.initialValues.scriptCode);
  const [inputPorts, setInputPorts] = useState<PythonPortConfig[]>(props.initialValues.inputPorts);
  const [outputPorts, setOutputPorts] = useState<PythonPortConfig[]>(props.initialValues.outputPorts);
  const [libraries, setLibraries] = useState<string[]>(props.initialValues.libraries);
  const [newLibrary, setNewLibrary] = useState('');

  // Notify parent of changes
  useEffect(() => {
    props.onSettingsChange({
      scriptCode,
      inputPorts,
      outputPorts,
      libraries
    });
  }, [scriptCode, inputPorts, outputPorts, libraries, props]);

  // Port management functions
  const addInputPort = () => {
    const newPort: PythonPortConfig = {
      name: `input_${inputPorts.length}`,
      type: 'data',
      dataType: 'table',
      required: false
    };
    setInputPorts([...inputPorts, newPort]);
  };

  const removeInputPort = (index: number) => {
    setInputPorts(inputPorts.filter((_, i) => i !== index));
  };

  const updateInputPort = (index: number, field: keyof PythonPortConfig, value: any) => {
    const updated = [...inputPorts];
    updated[index] = { ...updated[index], [field]: value };
    setInputPorts(updated);
  };

  const addOutputPort = () => {
    const newPort: PythonPortConfig = {
      name: `output_${outputPorts.length}`,
      type: 'data',
      dataType: 'table',
      required: false
    };
    setOutputPorts([...outputPorts, newPort]);
  };

  const removeOutputPort = (index: number) => {
    setOutputPorts(outputPorts.filter((_, i) => i !== index));
  };

  const updateOutputPort = (index: number, field: keyof PythonPortConfig, value: any) => {
    const updated = [...outputPorts];
    updated[index] = { ...updated[index], [field]: value };
    setOutputPorts(updated);
  };

  // Library management
  const addLibrary = () => {
    if (newLibrary.trim() && !libraries.includes(newLibrary.trim())) {
      setLibraries([...libraries, newLibrary.trim()]);
      setNewLibrary('');
    }
  };

  const removeLibrary = (library: string) => {
    setLibraries(libraries.filter(lib => lib !== library));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Python Script Configuration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure a custom Python script with configurable input/output ports and library dependencies.
        </p>
      </div>

      <Tabs defaultValue="script" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="ports">Ports</TabsTrigger>
          <TabsTrigger value="libraries">Libraries</TabsTrigger>
        </TabsList>

        <TabsContent value="script" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Python Script Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="script-code">Code</Label>
                <Textarea
                  id="script-code"
                  value={scriptCode}
                  onChange={(e) => setScriptCode(e.target.value)}
                  placeholder="Enter your Python script here..."
                  className="font-mono text-sm min-h-[400px]"
                />
                <p className="text-xs text-muted-foreground">
                  Your script should define a <code>process_data(input_data)</code> function that takes input data 
                  and returns processed results as dictionaries.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ports" className="space-y-4">
          {/* Input Ports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Input Ports
                <Button size="sm" onClick={addInputPort}>
                  <PlusIcon size={16} />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inputPorts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No input ports configured.</p>
              ) : (
                <div className="space-y-3">
                  {inputPorts.map((port, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-4 gap-4 items-end">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={port.name}
                              onChange={(e) => updateInputPort(index, 'name', e.target.value)}
                              placeholder="port_name"
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={port.type}
                              onValueChange={(value) => updateInputPort(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="data">Data</SelectItem>
                                <SelectItem value="parameter">Parameter</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Data Type</Label>
                            <Select
                              value={port.dataType}
                              onValueChange={(value) => updateInputPort(index, 'dataType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="table">Table</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeInputPort(index)}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Ports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Output Ports
                <Button size="sm" onClick={addOutputPort}>
                  <PlusIcon size={16} />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {outputPorts.length === 0 ? (
                <p className="text-sm text-muted-foreground">At least one output port is required.</p>
              ) : (
                <div className="space-y-3">
                  {outputPorts.map((port, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-4 gap-4 items-end">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={port.name}
                              onChange={(e) => updateOutputPort(index, 'name', e.target.value)}
                              placeholder="port_name"
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={port.type}
                              onValueChange={(value) => updateOutputPort(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="data">Data</SelectItem>
                                <SelectItem value="parameter">Parameter</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Data Type</Label>
                            <Select
                              value={port.dataType}
                              onValueChange={(value) => updateOutputPort(index, 'dataType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="table">Table</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeOutputPort(index)}
                            disabled={outputPorts.length === 1}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="libraries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Python Libraries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newLibrary}
                  onChange={(e) => setNewLibrary(e.target.value)}
                  placeholder="Library name (e.g., pandas, numpy)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addLibrary();
                    }
                  }}
                />
                <Button onClick={addLibrary} disabled={!newLibrary.trim()}>
                  <PlusIcon size={16} />
                  Add
                </Button>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Required Libraries:</div>
                {libraries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No libraries specified.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {libraries.map((library, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeLibrary(library)}
                      >
                        {library} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Common Libraries:</p>
                <div className="flex flex-wrap gap-1">
                  {['pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'scikit-learn'].map(lib => (
                    <Badge
                      key={lib}
                      variant="outline"
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        if (!libraries.includes(lib)) {
                          setLibraries([...libraries, lib]);
                        }
                      }}
                    >
                      {lib}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 