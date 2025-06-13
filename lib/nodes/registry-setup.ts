import { NodeRegistry } from './node-registry';
import { GroupAndAggregateNodeFactory } from './group-and-aggregate/node-factory';
import { DataInputNodeFactory } from './data-input/node-factory';
import { DataCleaningNodeFactory } from './data-cleaning/node-factory';
import { RowFilterNodeFactory } from './row-filter/node-factory';
import { PythonScriptNodeFactory } from './python-script/node-factory';

/**
 * Set up the node registry with all available node factories.
 * This centralizes the registration of all nodes to avoid file bloat in workflow editor.
 */
export function setupNodeRegistry(): void {
  const registry = NodeRegistry.getInstance();
  
  // Register all node factories
  registry.registerFactory(new GroupAndAggregateNodeFactory());
  registry.registerFactory(new DataInputNodeFactory());
  registry.registerFactory(new DataCleaningNodeFactory());
  registry.registerFactory(new RowFilterNodeFactory());
  registry.registerFactory(new PythonScriptNodeFactory());
  
  // TODO: Add more node factories as they are implemented:
  // - Data Transform Node (column operations, calculations)
  // - Data Analysis Node (statistics, correlations)
  // - Data Export Node (CSV, JSON, etc.)
  // - Data Visualization Node (charts, graphs)
  // - Data Join Node (merge datasets)
  // - Data Sort Node (sort by columns)
  // - Data Pivot Node (pivot tables)
}

/**
 * Get the configured node registry instance
 */
export function getNodeRegistry(): NodeRegistry {
  return NodeRegistry.getInstance();
} 