'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import { saveWorkflow, getWorkflowsByUserId } from '@/lib/db/workflow-queries';
import { generateUUID } from '@/lib/utils';

interface WorkflowState {
  workflows: any[];
  currentWorkflow: any | null;
  isLoading: boolean;
  error: string | null;
}

interface WorkflowContextType {
  workflowState: WorkflowState;
  saveCurrentWorkflow: (title: string, content: string, userId: string) => Promise<void>;
  loadWorkflows: (userId: string) => Promise<void>;
  setCurrentWorkflow: (workflow: any) => void;
  clearError: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    workflows: [],
    currentWorkflow: null,
    isLoading: false,
    error: null,
  });

  const saveCurrentWorkflow = useCallback(async (title: string, content: string, userId: string) => {
    setWorkflowState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const id = generateUUID();
      await saveWorkflow({ id, title, content, userId });
      
      // Reload workflows to get the updated list
      await loadWorkflows(userId);
      
      setWorkflowState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setWorkflowState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to save workflow' 
      }));
    }
  }, []);

  const loadWorkflows = useCallback(async (userId: string) => {
    setWorkflowState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const workflows = await getWorkflowsByUserId({ userId });
      setWorkflowState(prev => ({ 
        ...prev, 
        workflows, 
        isLoading: false 
      }));
    } catch (error) {
      setWorkflowState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load workflows' 
      }));
    }
  }, []);

  const setCurrentWorkflow = useCallback((workflow: any) => {
    setWorkflowState(prev => ({ ...prev, currentWorkflow: workflow }));
  }, []);

  const clearError = useCallback(() => {
    setWorkflowState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <WorkflowContext.Provider value={{
      workflowState,
      saveCurrentWorkflow,
      loadWorkflows,
      setCurrentWorkflow,
      clearError,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}
