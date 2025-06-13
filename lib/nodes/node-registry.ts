import type { NodeFactory } from './core';

/**
 * Registry for all node factories in the system
 */
export class NodeRegistry {
  private static instance: NodeRegistry;
  private factories: Map<string, NodeFactory<any>> = new Map();
  
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  static getInstance(): NodeRegistry {
    if (!NodeRegistry.instance) {
      NodeRegistry.instance = new NodeRegistry();
    }
    return NodeRegistry.instance;
  }
  
  /**
   * Register a node factory
   */
  registerFactory(factory: NodeFactory<any>): void {
    const metadata = factory.getNodeMetadata();
    this.factories.set(metadata.id, factory);
  }
  
  /**
   * Get all registered factories
   */
  getAllFactories(): NodeFactory<any>[] {
    return Array.from(this.factories.values());
  }
  
  /**
   * Get factories by category
   */
  getFactoriesByCategory(category: string): NodeFactory<any>[] {
    return Array.from(this.factories.values())
      .filter(factory => factory.getNodeMetadata().category.includes(category));
  }
  
  /**
   * Get a factory by ID
   */
  getFactory(id: string): NodeFactory<any> | undefined {
    return this.factories.get(id);
  }
}