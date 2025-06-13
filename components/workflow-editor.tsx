import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  useNodesState,
  useEdgesState,
  Panel,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, } from '@/components/ui/card';
// Sheet import removed - using fixed sidebar instead of modal sheet
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { 
  PlayIcon, 
  DownloadIcon, 
  UploadIcon, 
  TrashIcon, 
  MenuIcon,
  CrossIcon,
} from '@/components/icons';

import { NodeRegistry, type NodeFactory, type NodeDialog, type ExecutionContext, type DataTable, type DataTableSpec } from '@/lib/nodes/core';
import { Node as WorkflowNode } from '@/components/ui/node';
import { setupNodeRegistry } from '@/lib/nodes/registry-setup';

// Define the custom node component using the new WorkflowNode
const CustomNode: React.FC<any> = ({ id, data, selected }) => {
  return <WorkflowNode id={id} data={data} selected={selected} />;
};

// Define node types
const nodeTypes: NodeTypes = {
  customNode: CustomNode,
};

// Workflow Execution Engine
class WorkflowExecutionEngine {
  private nodes: Map<string, Node> = new Map();
  private edges: Edge[] = [];
  private executed: Set<string> = new Set();
  private executing: Set<string> = new Set();
  private nodeOutputs: Map<string, DataTable[]> = new Map();
  private onNodeStatusChange: (nodeId: string, status: string, outputs?: DataTable[], error?: string) => void;
  
  constructor(onNodeStatusChange: (nodeId: string, status: string, outputs?: DataTable[], error?: string) => void) {
    this.onNodeStatusChange = onNodeStatusChange;
  }
  
  setWorkflow(nodes: Node[], edges: Edge[]) {
    this.nodes.clear();
    nodes.forEach(node => this.nodes.set(node.id, node));
    this.edges = [...edges];
    this.executed.clear();
    this.executing.clear();
    this.nodeOutputs.clear();
  }
  
  async executeWorkflow() {
    // Reset execution state
    this.executed.clear();
    this.executing.clear();
    this.nodeOutputs.clear();
    
    // Find root nodes (nodes with no incoming edges)
    const rootNodes = Array.from(this.nodes.values()).filter(node => 
      !this.edges.some(edge => edge.target === node.id)
    );
    
    // Execute root nodes first
    const promises = rootNodes.map(node => this.executeNode(node.id));
    await Promise.all(promises);
  }
  
  private async executeNode(nodeId: string) {
    // Skip if already executed or executing
    if (this.executed.has(nodeId) || this.executing.has(nodeId)) {
      return;
    }
    
    const node = this.nodes.get(nodeId);
    if (!node) return;
    
    // Check if all predecessors have been executed
    const incomingEdges = this.edges.filter(edge => edge.target === nodeId);
    const predecessors = incomingEdges.map(edge => edge.source);
    
    if (predecessors.some(predId => !this.executed.has(predId))) {
      // Wait for predecessors to complete
      const predPromises = predecessors
        .filter(predId => !this.executed.has(predId))
        .map(predId => this.executeNode(predId));
      await Promise.all(predPromises);
    }
    
    // Start execution
    this.executing.add(nodeId);
    this.onNodeStatusChange(nodeId, 'executing');
    
    try {
      // Get input data from predecessors
      const inputs: DataTable[] = [];
      
      // Group incoming edges by target handle (input port)
      const inputsByPort = new Map<string, DataTable>();
      
      incomingEdges.forEach(edge => {
        const sourceNode = this.nodes.get(edge.source);
        if (!sourceNode) return;
        
        const sourceOutputs = this.nodeOutputs.get(edge.source) || [];
          // Extract port indices from handles
        const sourcePort = this.getPortIndex(edge.sourceHandle || null);
        const targetPort = this.getPortIndex(edge.targetHandle || null);
        
        if (sourcePort !== null && targetPort !== null && sourceOutputs[sourcePort]) {
          inputsByPort.set(`${targetPort}`, sourceOutputs[sourcePort]);
        }
      });
      
      // Sort inputs by port index
      const maxPort = Math.max(...Array.from(inputsByPort.keys()).map(p => Number.parseInt(p, 10)));
      for (let i = 0; i <= maxPort; i++) {
        inputs[i] = inputsByPort.get(`${i}`) || this.createEmptyTable();
      }
      
      // Execute the node
      const factory = node.data.factory as NodeFactory<any>;
      const nodeModel = factory.createNodeModel();
      
      // Load settings
      nodeModel.loadSettings(node.data.settings || {});
      
      // Create execution context
      const context: ExecutionContext = {
        createDataTable: (spec) => {
          // Return a container that collects data and returns a table when closed
          const rows: any[] = [];
          return {
            addRow: (key, cells) => {
              rows.push({ key, cells });
            },
            close: () => {
              return { spec, rows, size: rows.length, forEach: (cb) => rows.forEach(cb) };
            }
          };
        },
        checkCanceled: () => {
          // Check if execution was canceled (not implemented)
        },
        setProgress: (progress, message) => {
          // Update progress (not fully implemented)
          console.log(`Node ${nodeId} progress: ${progress * 100}% - ${message || ''}`);
        }
      };
      
      // Execute the node
      const outputs = await nodeModel.execute(inputs, context);
      
      // Store outputs
      this.nodeOutputs.set(nodeId, outputs);
      
      // Mark as executed
      this.executing.delete(nodeId);
      this.executed.add(nodeId);
      this.onNodeStatusChange(nodeId, 'success', outputs);
      
      // Execute successors
      const outgoingEdges = this.edges.filter(edge => edge.source === nodeId);
      const successors = [...new Set(outgoingEdges.map(edge => edge.target))];
      
      const successorPromises = successors.map(succId => this.executeNode(succId));
      await Promise.all(successorPromises);
      
    } catch (error) {
      // Handle execution error
      this.executing.delete(nodeId);
      this.executed.add(nodeId); // Mark as executed even if failed
      this.onNodeStatusChange(nodeId, 'error', undefined, error instanceof Error ? error.message : String(error));
      console.error(`Error executing node ${nodeId}:`, error);
    }
  }
  
  private getPortIndex(handle: string | null): number | null {
    if (!handle) return null;
    const match = handle.match(/^(source|target)-(\d+)$/);
    return match ? Number.parseInt(match[2], 10) : null;
  }
    private createEmptyTable(): DataTable {
    return {
      spec: { 
        columns: [],
        findColumnIndex: () => -1
      },
      rows: [],
      size: 0,
      forEach: (cb) => {}
    };
  }
  
  // Reset the execution state of a node
  resetNode(nodeId: string) {
    this.executed.delete(nodeId);
    this.executing.delete(nodeId);
    this.nodeOutputs.delete(nodeId);
    this.onNodeStatusChange(nodeId, 'reset');
  }
  
  // Reset the entire workflow
  resetWorkflow() {
    this.executed.clear();
    this.executing.clear();
    this.nodeOutputs.clear();
    this.nodes.forEach(node => {
      this.onNodeStatusChange(node.id, 'reset');
    });
  }

  // Execute a single node individually (without executing successors)
  async executeSingleNode(nodeId: string) {
    try {
      await this.executeNodeOnly(nodeId);
      toast.success(`Single node executed successfully`);
    } catch (error) {
      toast.error(`Node execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Execute only the specified node without executing successors
  // This is different from executeNode() which executes the entire downstream chain
  private async executeNodeOnly(nodeId: string) {
    // Skip if already executing
    if (this.executing.has(nodeId)) {
      return;
    }
    
    const node = this.nodes.get(nodeId);
    if (!node) return;
    
    // Start execution
    this.executing.add(nodeId);
    this.onNodeStatusChange(nodeId, 'executing');
    
    try {
      // Get input data from predecessors (only from already executed nodes)
      const inputs: DataTable[] = [];
      const incomingEdges = this.edges.filter(edge => edge.target === nodeId);
      
      // Group incoming edges by target handle (input port)
      const inputsByPort = new Map<string, DataTable>();
      
      incomingEdges.forEach(edge => {
        const sourceNode = this.nodes.get(edge.source);
        if (!sourceNode) return;
        
        // Only use data from already executed nodes
        const sourceOutputs = this.nodeOutputs.get(edge.source) || [];
        if (sourceOutputs.length === 0) return; // Skip if source hasn't been executed
        
        // Extract port indices from handles
        const sourcePort = this.getPortIndex(edge.sourceHandle || null);
        const targetPort = this.getPortIndex(edge.targetHandle || null);
        
        if (sourcePort !== null && targetPort !== null && sourceOutputs[sourcePort]) {
          inputsByPort.set(`${targetPort}`, sourceOutputs[sourcePort]);
        }
      });
      
      // Sort inputs by port index
      const maxPort = Math.max(...Array.from(inputsByPort.keys()).map(p => Number.parseInt(p, 10)));
      for (let i = 0; i <= maxPort; i++) {
        inputs[i] = inputsByPort.get(`${i}`) || this.createEmptyTable();
      }
      
      // Execute the node
      const factory = node.data.factory as NodeFactory<any>;
      const nodeModel = factory.createNodeModel();
      
      // Load settings
      nodeModel.loadSettings(node.data.settings || {});
      
      // Create execution context
      const context: ExecutionContext = {
        createDataTable: (spec) => {
          // Return a container that collects data and returns a table when closed
          const rows: any[] = [];
          return {
            addRow: (key, cells) => {
              rows.push({ key, cells });
            },
            close: () => {
              return { spec, rows, size: rows.length, forEach: (cb) => rows.forEach(cb) };
            }
          };
        },
        checkCanceled: () => {
          // Check if execution was canceled (not implemented)
        },
        setProgress: (progress, message) => {
          // Update progress (not fully implemented)
          console.log(`Node ${nodeId} progress: ${progress * 100}% - ${message || ''}`);
        }
      };
      
      // Execute the node
      const outputs = await nodeModel.execute(inputs, context);
      
      // Store outputs
      this.nodeOutputs.set(nodeId, outputs);
      
      // Mark as executed
      this.executing.delete(nodeId);
      this.executed.add(nodeId);
      this.onNodeStatusChange(nodeId, 'success', outputs);
      
      // NOTE: We intentionally DO NOT execute successors for individual node execution
      
    } catch (error) {
      // Handle execution error
      this.executing.delete(nodeId);
      this.executed.add(nodeId); // Mark as executed even if failed
      this.onNodeStatusChange(nodeId, 'error', undefined, error instanceof Error ? error.message : String(error));
      console.error(`Error executing node ${nodeId}:`, error);
    }
  }
}

// Main Workflow Editor Component
export const WorkflowEditor: React.FC = () => {
  // Node registry for available nodes
  const registry = NodeRegistry.getInstance();
  
  // Setup node registry with all available factories
  useEffect(() => {
    setupNodeRegistry();
  }, []);
    
  // Workflow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nodeToConfig, setNodeToConfig] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViewNode, setSelectedViewNode] = useState<string | null>(null);
  
  // References
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  // Execution engine
  const executionEngineRef = useRef<WorkflowExecutionEngine>(
    new WorkflowExecutionEngine((nodeId, status, outputs, error) => {
      setNodes(nodes => nodes.map(node => 
        node.id === nodeId ? {
          ...node,
          data: {
            ...node.data,
            status,
            outputs,
            error,
            executed: status !== 'reset'
          }
        } : node
      ));
    })
  );
  
  // Update execution engine when nodes or edges change
  useEffect(() => {
    executionEngineRef.current.setWorkflow(nodes, edges);
  }, [nodes, edges]);
  
  // Get input specs for a node based on its connections
  const getNodeInputSpecs = useCallback((nodeId: string): DataTableSpec[] => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return [];
    
    const incomingEdges = edges.filter(e => e.target === nodeId);
    return Array(node.data.inputPorts).fill(null).map((_, portIndex) => {
      // Find the edge connected to this input port
      const edge = incomingEdges.find(e => {
        const targetPortIndex = e.targetHandle ? Number.parseInt(e.targetHandle.split('-')[1]) : 0;
        return targetPortIndex === portIndex;
      });
      
      if (edge) {
        // Get the source node and its output spec
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (sourceNode?.data.outputs && sourceNode.data.outputs.length > 0) {
          const sourcePortIndex = edge.sourceHandle ? Number.parseInt(edge.sourceHandle.split('-')[1]) : 0;
          const output = sourceNode.data.outputs[sourcePortIndex];
          if (output?.spec) {
            return output.spec;
          }
        }
      }
      
      // Default empty spec
      return { columns: [], findColumnIndex: () => -1 };
    });
  }, [nodes, edges]);
  
  // Connection handlers
  const onConnect = useCallback((connection: Connection) => {
    console.log('Attempting to connect:', connection);
    
    // Validate connection
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    if (!sourceNode || !targetNode) {
      console.warn('Source or target node not found');
      return;
    }
    
    // Prevent self-connection
    if (connection.source === connection.target) {
      toast.error('Cannot connect a node to itself');
      return;
    }
    
    // Check for cycles
    if (wouldCreateCycle(connection, edges, nodes)) {
      toast.error('Cannot create connection: would create a cycle in the workflow');
      return;
    }
    
    // Check if target input already has a connection
    const existingEdges = edges.filter(e => 
      e.target === connection.target && 
      e.targetHandle === connection.targetHandle
    );
    
    if (existingEdges.length > 0) {
      // Replace existing connection
      const updatedEdges = edges.filter(e => 
        !(e.target === connection.target && e.targetHandle === connection.targetHandle)
      );
      setEdges(addEdge(connection, updatedEdges));
      toast.info('Replaced existing connection');
    } else {
      // Add new connection
      setEdges(addEdge(connection, edges));
      toast.success('Connection created');
    }
    
    // Reset execution state of affected nodes
    if (connection.target) {
      resetNodeAndSuccessors(connection.target);
    }
  }, [nodes, edges, setEdges]);
  
  // Check if a connection would create a cycle
  const wouldCreateCycle = (connection: Connection, existingEdges: Edge[], nodes: Node[]): boolean => {
    // Create a graph representation
    const graph = new Map<string, string[]>();
    
    // Add all nodes to the graph
    nodes.forEach(node => {
      graph.set(node.id, []);
    });
    
    // Add existing edges
    existingEdges.forEach(edge => {
      const successors = graph.get(edge.source) || [];
      successors.push(edge.target);
      graph.set(edge.source, successors);
    });
    
    // Add the new connection
    if (connection.source && connection.target) {
      const successors = graph.get(connection.source) || [];
      successors.push(connection.target);
      graph.set(connection.source, successors);
    }
    
    // DFS to check for cycles
    const visited = new Set<string>();
    const path = new Set<string>();
    
    function hasCycle(node: string): boolean {
      if (path.has(node)) return true;
      if (visited.has(node)) return false;
      
      visited.add(node);
      path.add(node);
      
      const successors = graph.get(node) || [];
      for (const succ of successors) {
        if (hasCycle(succ)) return true;
      }
      
      path.delete(node);
      return false;
    }
    
    // Check for cycles from all nodes
    for (const node of graph.keys()) {
      if (!visited.has(node) && hasCycle(node)) return true;
    }
    
    return false;
  };
  
  // Reset a node and all its successors
  const resetNodeAndSuccessors = (nodeId: string) => {
    const visited = new Set<string>();
    
    function resetDFS(id: string) {
      if (visited.has(id)) return;
      visited.add(id);
      
      // Reset this node
      executionEngineRef.current.resetNode(id);
      
      // Find all successors
      const outgoingEdges = edges.filter(e => e.source === id);
      const successors = outgoingEdges.map(e => e.target);
      
      // Reset all successors
      successors.forEach(resetDFS);
    }
    
    resetDFS(nodeId);
  };
  
  // Drag & drop handlers
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      console.log('Drop event triggered');
      
      if (!reactFlowWrapper.current || !reactFlowInstance) {
        console.warn('ReactFlow not ready for drop');
        toast.error('Workflow editor not ready. Please wait a moment and try again.');
        return;
      }
      
      const factoryId = event.dataTransfer.getData('application/reactflow');
      console.log('Factory ID from drag data:', factoryId);
      
      if (!factoryId) {
        console.warn('No factory ID in drag data');
        toast.error('Invalid drag data. Please try dragging the node again.');
        return;
      }
      
      // Get the factory from the registry
      const factory = registry.getFactory(factoryId);
      if (!factory) {
        console.warn('Factory not found for ID:', factoryId);
        toast.error(`Node type '${factoryId}' not found in registry.`);
        return;
      }
      
      const metadata = factory.getNodeMetadata();
      console.log('Creating node with metadata:', metadata);
      
      // Get position to place the node
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      console.log('Node position:', position);
      
      // Create a new node model to get port counts
      const nodeModel = factory.createNodeModel();
      const inputPorts = nodeModel.getInputPortCount();
      const outputPorts = nodeModel.getOutputPortCount();
      
      const newNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'customNode',
        position,
        data: { 
          label: metadata.name,
          factory,
          status: 'idle',
          executed: false,
          inputPorts,
          outputPorts,
          settings: {},
          onConfigure: (id: string) => {
            setNodeToConfig(id);
            setDialogOpen(true);
          },
          onViewResult: (id: string) => {
            setSelectedViewNode(id);
            setViewDialogOpen(true);
          },
          onExecute: (id: string) => {
            executeNode(id);
          }
        },
      };
      
      console.log('Adding new node:', newNode);
      setNodes((nds) => nds.concat(newNode));
      toast.success(`Added ${metadata.name} node to workflow`);
    },
    [reactFlowInstance, setNodes]
  );
  
  // Node selection handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);
    // Execute workflow
  const executeWorkflow = useCallback(async () => {
    try {
      await executionEngineRef.current.executeWorkflow();
      toast.success('Workflow executed successfully');
    } catch (error) {
      toast.error(`Workflow execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  // Execute single node
  const executeNode = useCallback(async (nodeId: string) => {
    try {
      await executionEngineRef.current.executeSingleNode(nodeId);
    } catch (error) {
      console.error('Node execution failed:', error);
    }
  }, []);
  
  // Reset workflow
  const resetWorkflow = useCallback(() => {
    executionEngineRef.current.resetWorkflow();
    toast.info('Workflow reset');
  }, []);
  
  // Save workflow
  const saveWorkflow = useCallback(() => {
    const workflow = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label,
          factoryId: node.data.factory.getNodeMetadata().id,
          settings: node.data.settings,
          inputPorts: node.data.inputPorts,
          outputPorts: node.data.outputPorts,
        }
      })),
      edges
    };
    
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Workflow saved');
  }, [nodes, edges]);
  
  // Load workflow
  const loadWorkflow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const workflow = JSON.parse(content);
          
          // Recreate nodes with factories
          const newNodes = workflow.nodes.map((node: any) => {
            const factory = registry.getFactory(node.data.factoryId);
            if (!factory) {
              throw new Error(`Node factory "${node.data.factoryId}" not found`);
            }
            
            return {
              ...node,
              data: {
                ...node.data,
                factory,
                status: 'idle',
                executed: false,
                onConfigure: (id: string) => {
                  setNodeToConfig(id);
                  setDialogOpen(true);
                },
                onViewResult: (id: string) => {
                  setSelectedViewNode(id);
                  setViewDialogOpen(true);
                },
                onExecute: (id: string) => {
                  executeNode(id);
                }
              }
            };
          });
          
          setNodes(newNodes);
          setEdges(workflow.edges);
          toast.success('Workflow loaded');
        } catch (error) {
          toast.error(`Failed to load workflow: ${error instanceof Error ? error.message : String(error)}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [registry, setNodes, setEdges]);
    // Node configuration dialog
  const renderConfigDialog = () => {
    if (!nodeToConfig) return null;
    
    const node = nodes.find(n => n.id === nodeToConfig);
    if (!node) return null;
    
    const factory = node.data.factory as NodeFactory<any>;
    const nodeDialog = factory.createNodeDialog();
    
    if (!nodeDialog) return null;
    
    // Get real specs from connected nodes
    const specs = getNodeInputSpecs(node.id);
    
    // Save dialog settings
    const saveSettings = (settings: any) => {
      setNodes(nodes => nodes.map(n => 
        n.id === nodeToConfig ? {
          ...n,
          data: {
            ...n.data,
            settings
          }
        } : n
      ));
      
      // Reset node and successors when configuration changes
      resetNodeAndSuccessors(nodeToConfig);
      
      setDialogOpen(false);
    };
    
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Configure {node.data.label}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {React.createElement(ConfigDialogWrapper, {
              nodeDialog,
              settings: node.data.settings || {},
              specs,
              onSave: saveSettings
            })}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // This triggers the save in the wrapper component
                const saveEvent = new CustomEvent('dialog-save');
                document.dispatchEvent(saveEvent);
              }}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
    // Configuration dialog wrapper component
  const ConfigDialogWrapper: React.FC<{
    nodeDialog: NodeDialog;
    settings: any;
    specs: any[];
    onSave: (settings: any) => void;
  }> = ({ nodeDialog, settings, specs, onSave }) => {
    const settingsRef = useRef<any>({ ...settings });
    
    // Create mock settings object with getter/setter methods
    const mockSettings = {
      getString: (key: string, defaultValue = '') => {
        return settingsRef.current[key] || defaultValue;
      },
      getNumber: (key: string, defaultValue = 0) => {
        return settingsRef.current[key] || defaultValue;
      },
      getBoolean: (key: string, defaultValue = false) => {
        return settingsRef.current[key] || defaultValue;
      },
      set: (key: string, value: any) => {
        settingsRef.current[key] = value;
      }
    };
    
    // Update settings ref when external settings change
    useEffect(() => {
      settingsRef.current = { ...settings };
    }, [settings]);
    
    // Initialize dialog
    useEffect(() => {
      try {
        nodeDialog.loadSettings(mockSettings, specs);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }, [nodeDialog, settings, specs]);
    
    // Save handler
    useEffect(() => {
      const handleSave = () => {
        try {
          nodeDialog.saveSettings(mockSettings);
          onSave(settingsRef.current);
        } catch (error) {
          console.error('Error saving settings:', error);
          toast.error(`Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
        }
      };
      
      document.addEventListener('dialog-save', handleSave);
      return () => document.removeEventListener('dialog-save', handleSave);
    }, [nodeDialog, onSave, mockSettings]);
    
    // Create dialog panel
    const dialogPanel = nodeDialog.createDialogPanel(mockSettings, specs);
    
    return <>{dialogPanel}</>;
  };

  // Node view result dialog
  const renderViewDialog = () => {
    if (!selectedViewNode) return null;
    
    const node = nodes.find(n => n.id === selectedViewNode);
    if (!node || !node.data.executed || node.data.status === 'error') return null;
    
    const factory = node.data.factory as NodeFactory<any>;
    const nodeModel = factory.createNodeModel();
    
    // Load settings into the model
    nodeModel.loadSettings(node.data.settings || {});
    
    // Create node views
    const nodeViews = factory.createNodeViews(nodeModel);
    if (nodeViews.length === 0) return null;
    
    const nodeView = nodeViews[0];
    
    // Pass the loaded data to the view if available
    if (node.data.outputs && node.data.outputs.length > 0) {
      if (typeof (nodeView as any).setLoadedData === 'function') {
        (nodeView as any).setLoadedData(node.data.outputs[0]);
      }
    }
    
    // Notify the view that the model has changed to ensure it shows current data
    nodeView.onModelChanged();
    
    return (
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              View Results - {node.data.label}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {React.createElement(ViewDialogWrapper, {
              nodeView,
              outputs: node.data.outputs || [],
              nodeData: node.data
            })}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // View dialog wrapper component
  const ViewDialogWrapper: React.FC<{
    nodeView: any;
    outputs: DataTable[];
    nodeData: any;
  }> = ({ nodeView, outputs, nodeData }) => {
    // If we have outputs but the view doesn't have loaded data, set it
    useEffect(() => {
      if (outputs && outputs.length > 0) {
        if (typeof nodeView.setLoadedData === 'function') {
          nodeView.setLoadedData(outputs[0]);
        }
      }
    }, [nodeView, outputs]);
    
    // Create the view panel
    const viewPanel = nodeView.createViewPanel();
    
    return <>{viewPanel}</>;
  };
    
  // Render node palette as a fixed sidebar
  const renderNodePalette = () => {
    // Group nodes by category
    const nodesByCategory = new Map<string, NodeFactory<any>[]>();
    
    registry.getAllFactories().forEach(factory => {
      const metadata = factory.getNodeMetadata();
      metadata.category.forEach(category => {
        if (!nodesByCategory.has(category)) {
          nodesByCategory.set(category, []);
        }
        nodesByCategory.get(category)?.push(factory);
      });
    });
    
    if (!drawerOpen) {
      return null;
    }
    
    return (
      <div className="w-80 border-r bg-background h-full flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MenuIcon size={20} />
              <h2 className="text-lg font-semibold">Node Palette</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDrawerOpen(false)}
            >
              <CrossIcon size={16} />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Array.from(nodesByCategory.entries()).map(([category, factories]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                <MenuIcon size={14} />
                {category}
              </div>
              
              <div className="space-y-1">
                {factories.map(factory => {
                  const metadata = factory.getNodeMetadata();
                  return (
                    <div 
                      key={metadata.id}
                      className="p-2 border rounded-lg cursor-grab hover:bg-muted/50 transition-colors select-none"
                      draggable
                      onDragStart={(event) => {
                        console.log('Drag started for node:', metadata.name, 'ID:', metadata.id);
                        event.dataTransfer.setData('application/reactflow', metadata.id);
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={(event) => {
                        console.log('Drag ended for node:', metadata.name);
                      }}
                    >
                      <div className="font-medium text-sm">{metadata.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {metadata.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ID: {metadata.id}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  };
    return (
    <TooltipProvider>
      <div className="flex h-screen">
        {renderNodePalette()}
        
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b bg-background p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                  className={drawerOpen ? 'hidden' : ''}
                >
                  <MenuIcon size={16} />
                </Button>
                
                <h1 className="text-lg font-semibold">Workflow Editor</h1>
              </div>
              
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={executeWorkflow}>
                      <PlayIcon size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Execute Workflow</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={resetWorkflow}>
                      <TrashIcon size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset Workflow</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={saveWorkflow}>
                      <DownloadIcon size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save Workflow</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={loadWorkflow}>
                      <UploadIcon size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Load Workflow</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          
          <div className="flex-1" ref={reactFlowWrapper}>
            <style jsx global>{`
              .react-flow__handle {
                width: 16px !important;
                height: 16px !important;
                border-radius: 50% !important;
                border: 2px solid white !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
              }
              .react-flow__handle-left {
                left: -8px !important;
              }
              .react-flow__handle-right {
                right: -8px !important;
              }
              .custom-node:hover .react-flow__handle {
                opacity: 1 !important;
              }
              .custom-node .react-flow__handle {
                opacity: 0.8;
                transition: opacity 0.2s;
              }
              .react-flow__node.selected .custom-node {
                box-shadow: 0 0 0 2px #3b82f6;
              }
            `}</style>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
                connectionLineType={ConnectionLineType.SmoothStep}
                snapToGrid={true}
                snapGrid={[20, 20]}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                minZoom={0.2}
                maxZoom={2}
                deleteKeyCode={['Backspace', 'Delete']}
                multiSelectionKeyCode={['Meta', 'Ctrl']}
                panOnDrag={true}
                selectionOnDrag={false}
                panOnScroll={false}
                zoomOnScroll={true}
                zoomOnPinch={true}
                preventScrolling={true}
              >
                <Controls />
                <Background color="#aaa" gap={16} />
                
                <Panel position="top-right">
                  <Card className="w-72">
                    <CardContent className="p-4">
                      {selectedNode ? (
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium">{selectedNode.data.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              Status: {selectedNode.data.status || 'idle'}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setNodeToConfig(selectedNode.id);
                              setDialogOpen(true);
                            }}
                            className="w-full"
                          >
                            Configure
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Select a node to see details
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Panel>
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </div>
        
        {renderConfigDialog()}
        {renderViewDialog()}
      </div>
    </TooltipProvider>
  );
};

export default WorkflowEditor;