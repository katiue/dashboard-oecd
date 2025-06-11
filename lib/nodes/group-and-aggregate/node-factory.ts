import { NodeFactory, NodeDialog, NodeView, NodeMetadata } from '../core';
import { GroupAndAggregateNodeModel } from './node-model';
import { GroupAndAggregateNodeDialog } from './node-dialog';
import { GroupAndAggregateNodeView } from './node-view';

/**
 * Factory for the Group and Aggregate Node
 */
export class GroupAndAggregateNodeFactory extends NodeFactory<GroupAndAggregateNodeModel> {
  /**
   * Creates a new node model instance
   */
  createNodeModel(): GroupAndAggregateNodeModel {
    return new GroupAndAggregateNodeModel();
  }

  /**
   * Creates the node dialog for configuration
   */
  createNodeDialog(): NodeDialog {
    return new GroupAndAggregateNodeDialog();
  }

  /**
   * Creates node views for visualization
   */
  createNodeViews(nodeModel: GroupAndAggregateNodeModel): NodeView<GroupAndAggregateNodeModel>[] {
    return [new GroupAndAggregateNodeView(nodeModel)];
  }

  /**
   * Returns metadata about the node
   */
  getNodeMetadata(): NodeMetadata {
    return {
      id: 'org.example.groupaggregate',
      name: 'Group & Aggregate',
      description: 'Groups data by specified columns and performs aggregation operations on other columns.',
      category: ['Data Processing', 'Transformation'],
      keywords: ['group', 'aggregate', 'sum', 'average', 'count', 'groupby']
    };
  }
}