import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkflowEditor } from './workflow-editor';
import { NodeRegistry } from '@/lib/nodes/node-registry';
import { GroupAndAggregateNodeFactory } from '@/lib/nodes/group-and-aggregate/node-factory';

// Register your nodes
const registry = NodeRegistry.getInstance();
registry.registerFactory(new GroupAndAggregateNodeFactory());
// Register more nodes...

const root = createRoot(document.getElementById('root')!);
root.render(<WorkflowEditor />);