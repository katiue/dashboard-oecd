import type { DataTableSpec, SettingsObject } from '@/lib/types';
import type { ReactElement } from 'react';

/**
 * Abstract base class for node configuration dialogs
 */
export abstract class NodeDialog {
  /**
   * Creates the React component for the dialog UI
   */
  abstract createDialogPanel(
    settings: SettingsObject,
    specs: DataTableSpec[]
  ): ReactElement;

  /**
   * Called when dialog is closed with OK to save settings
   */
  abstract saveSettings(settings: SettingsObject): void;

  /**
   * Called when dialog is opened to initialize with current settings
   */
  abstract loadSettings(settings: SettingsObject, specs: DataTableSpec[]): void;
}