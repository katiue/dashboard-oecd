import { NodeFactory, NodeDialog, NodeMetadata, NodeView } from '../core';
import { PythonScriptNodeModel } from './node-model';
import { PythonScriptNodeDialog } from './node-dialog';
import { PythonScriptNodeView } from './node-view';

export class PythonScriptNodeFactory extends NodeFactory<PythonScriptNodeModel> {
  
  createNodeModel(): PythonScriptNodeModel {
    return new PythonScriptNodeModel();
  }

  createNodeDialog(): NodeDialog {
    return new PythonScriptNodeDialog();
  }

  createNodeViews(nodeModel: PythonScriptNodeModel): NodeView<PythonScriptNodeModel>[] {
    return [new PythonScriptNodeView(nodeModel)];
  }

  getNodeMetadata(): NodeMetadata {
    return {
      id: 'python_script',
      name: 'Python Script',
      description: 'Execute custom Python scripts with configurable input/output ports and library dependencies',
      category: ['Custom Scripts', 'Advanced']
    };
  }
} 