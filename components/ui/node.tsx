"use client"

import React from 'react'
import { Handle, Position } from 'reactflow'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoaderIcon, EyeIcon, PlayIcon } from '@/components/icons'
import { SettingsIcon } from 'lucide-react'
import { DataTable } from '@/lib/types'

export interface NodeData {
  label: string
  factory: any
  status?: 'idle' | 'executing' | 'success' | 'error' | 'warning'
  executed?: boolean
  outputs?: DataTable[]
  error?: string
  inputPorts: number
  outputPorts: number
  settings?: any
  onConfigure: (nodeId: string) => void
  onViewResult?: (nodeId: string) => void
  onExecute?: (nodeId: string) => void
}

export interface NodeProps {
  id: string
  data: NodeData
  selected?: boolean
}

export const Node: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { 
    label, 
    status = 'idle', 
    executed = false, 
    outputs, 
    error,
    inputPorts,
    outputPorts,
    onConfigure,
    onViewResult,
    onExecute
  } = data
  
  // Determine node style based on status
  let className = 'border-2 rounded-lg bg-background'
  
  switch (status) {
    case 'executing':
      className = 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950'
      break
    case 'success':
      className = 'border-2 border-green-500 bg-green-50 dark:bg-green-950'
      break
    case 'error':
      className = 'border-2 border-red-500 bg-red-50 dark:bg-red-950'
      break
    case 'warning':
      className = 'border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      break
    default:
      className = executed 
        ? 'border-2 border-muted bg-muted/50' 
        : 'border-2 border-border bg-background'
  }

  if (selected) {
    className += ' shadow-lg ring-2 ring-blue-500'
  }
  
  return (
    <div className="custom-node w-48 relative">
      {/* Input Handles */}
      {Array.from({ length: inputPorts }).map((_, i) => (
        <Handle
          key={`input-${i}`}
          type="target"
          position={Position.Left}
          id={`target-${i}`}
          style={{
            top: `${40 + i * 25}px`,
            left: '-8px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#8b5cf6',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
      ))}
      
      {/* Output Handles */}
      {Array.from({ length: outputPorts }).map((_, i) => (
        <Handle
          key={`output-${i}`}
          type="source"
          position={Position.Right}
          id={`source-${i}`}
          style={{
            top: `${40 + i * 25}px`,
            right: '-8px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#f97316',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
      ))}
      
      <Card className={className}>
        {/* Node Header */}
        <CardHeader className="p-2 pb-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium truncate max-w-32">
              {label}
            </CardTitle>
            
            <div className="flex items-center gap-1">
              {status === 'executing' && (
                <div className="animate-spin">
                  <LoaderIcon size={14} />
                </div>
              )}
              
              {onExecute && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onExecute(id)}
                  disabled={status === 'executing'}
                  title="Execute this node only (without successors)"
                >
                  <PlayIcon size={12} />
                </Button>
              )}
              
              {onViewResult && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onViewResult(id)}
                  disabled={!executed || status === 'error'}
                  title="View results"
                >
                  <EyeIcon size={12} />
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => onConfigure(id)}
                title="Configure node"
              >
                <SettingsIcon size={12} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Node Body - Display simplified port info */}
        <CardContent className="p-2 pt-0 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>In: {inputPorts}</span>
            <span>Out: {outputPorts}</span>
          </div>
        </CardContent>
        
        {/* Node Footer - Display status or output summary */}
        {status === 'error' && (
          <div className="p-2 pt-0">
            <div className="text-xs text-red-600 dark:text-red-400">
              {error || 'Execution failed'}
            </div>
          </div>
        )}
        
        {outputs && outputs.length > 0 && status === 'success' && (
          <div className="p-2 pt-0 border-t bg-muted/30">
            <div className="text-xs font-medium mb-1">Output Summary:</div>
            {outputs.map((output: DataTable, i: number) => (
              <div key={i} className="text-xs">
                Output {i+1}: {output.rows.length} rows
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default Node 