import { NodeModel } from './node-model';
import { ReactElement } from 'react';

/**
 * Abstract base class for node visualization views
 */
export abstract class NodeView<T extends NodeModel> {
  protected nodeModel: T;

  constructor(nodeModel: T) {
    this.nodeModel = nodeModel;
  }

  /**
   * Creates the React component for the view UI
   */
  abstract createViewPanel(): ReactElement;

  /**
   * Called when the underlying model has changed
   */
  abstract onModelChanged(): void;

  /**
   * Called when the view is closed
   */
  onClose(): void {
    // Default implementation does nothing
  }
}