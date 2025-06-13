import type { DataTable, DataTableSpec, ExecutionContext, SettingsObject } from '@/lib/types';

/**
 * Abstract base class for all node models in the system
 */
export abstract class NodeModel {
  private readonly inPorts: number;
  private readonly outPorts: number;

  constructor(inPorts: number, outPorts: number) {
    this.inPorts = inPorts;
    this.outPorts = outPorts;
  }

  /**
   * The main execution method that processes input data and generates output
   */
  abstract execute(inData: DataTable[], context: ExecutionContext): Promise<DataTable[]>;

  /**
   * Configures the node based on input data specifications
   */
  abstract configure(inSpecs: DataTableSpec[]): DataTableSpec[];

  /**
   * Loads the node's configuration settings
   */
  abstract loadSettings(settings: SettingsObject): void;

  /**
   * Saves the node's configuration settings
   */
  abstract saveSettings(settings: SettingsObject): void;

  /**
   * Validates the node's configuration settings
   */
  abstract validateSettings(settings: SettingsObject): void;

  /**
   * Resets the node's state
   */
  reset(): void {
    // Default implementation does nothing
  }

  /**
   * Returns the number of input ports
   */
  getInputPortCount(): number {
    return this.inPorts;
  }

  /**
   * Returns the number of output ports
   */
  getOutputPortCount(): number {
    return this.outPorts;
  }
}