import { NodeFactory, type NodeDialog, type NodeMetadata, type NodeView } from '../core';
import { DataCleaningNodeModel } from './node-model';
import { DataCleaningNodeDialog } from './node-dialog';
import { DataCleaningNodeView } from './node-view';

export class DataCleaningNodeFactory extends NodeFactory<DataCleaningNodeModel> {
  
  createNodeModel(): DataCleaningNodeModel {
    return new DataCleaningNodeModel();
  }

  createNodeDialog(): NodeDialog {
    return new DataCleaningNodeDialog();
  }

  createNodeViews(nodeModel: DataCleaningNodeModel): NodeView<DataCleaningNodeModel>[] {
    return [new DataCleaningNodeView(nodeModel)];
  }

  getNodeMetadata(): NodeMetadata {
    return {
      id: 'data_cleaning',
      name: 'Data Cleaning',
      description: 'Comprehensive data cleaning including duplicate handling, type inference, and value normalization',
      category: ['Data Processing']
    };
  }
} 