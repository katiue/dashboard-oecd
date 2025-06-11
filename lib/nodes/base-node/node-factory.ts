import { NodeModel } from './node-model';
import { NodeDialog } from './node-dialog';
import { NodeView } from './node-view';
import { NodeMetadata } from '@/lib/types';

/**
 * Factory for creating node components (model, dialog, view)
 */
export abstract class NodeFactory<T extends NodeModel> {
  /**
   * Creates a new node model instance
   */
  abstract createNodeModel(): T;

  /**
   * Creates the node dialog for configuration
   */
  abstract createNodeDialog(): NodeDialog | null;

  /**
   * Creates node views for visualization
   */
  abstract createNodeViews(nodeModel: T): NodeView<T>[];

  /**
   * Returns metadata about the node
   */
  abstract getNodeMetadata(): NodeMetadata;

  /**
   * Indicates if this node has a configuration dialog
   */
  hasDialog(): boolean {
    return true;
  }
}