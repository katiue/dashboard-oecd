import { NodeFactory, type NodeDialog, type NodeMetadata, type NodeView } from '../core';
import { RowFilterNodeModel } from './node-model';
import { RowFilterNodeDialog } from './node-dialog';
import { RowFilterNodeView } from './node-view';

export class RowFilterNodeFactory extends NodeFactory<RowFilterNodeModel> {
  
  createNodeModel(): RowFilterNodeModel {
    return new RowFilterNodeModel();
  }

  createNodeDialog(): NodeDialog {
    return new RowFilterNodeDialog();
  }

  createNodeViews(nodeModel: RowFilterNodeModel): NodeView<RowFilterNodeModel>[] {
    return [new RowFilterNodeView(nodeModel)];
  }

  getNodeMetadata(): NodeMetadata {
    return {
      id: 'row_filter',
      name: 'Row Filter',
      description: 'Filter rows based on column conditions (e.g., Species equals "panda")',
      category: ['Data Processing']
    };
  }
} 