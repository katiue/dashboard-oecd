import { NodeFactory, NodeDialog, NodeMetadata, NodeView } from '../core';
import { DataInputNodeModel } from './node-model';
import { DataInputNodeDialog } from './node-dialog';
import { DataInputNodeView } from './node-view';

export class DataInputNodeFactory extends NodeFactory<DataInputNodeModel> {
  
  createNodeModel(): DataInputNodeModel {
    return new DataInputNodeModel();
  }

  createNodeDialog(): NodeDialog {
    return new DataInputNodeDialog();
  }

  createNodeViews(nodeModel: DataInputNodeModel): NodeView<DataInputNodeModel>[] {
    return [new DataInputNodeView(nodeModel)];
  }

  getNodeMetadata(): NodeMetadata {
    return {
      id: 'data_input',
      name: 'Data Input',
      description: 'Input data from various sources',
      category: ['Data Sources']
    };
  }
} 