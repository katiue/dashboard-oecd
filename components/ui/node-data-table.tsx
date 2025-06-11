"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTable, DataRow, Cell, ColumnSpec } from "@/lib/types"

// Define UI types locally since we're no longer using the complex DataTable
export interface DataTableColumn {
  name: string
  type?: string
}

export interface DataTableRow {
  [key: string]: any
}

// Adapter functions to convert between node types and UI types
export function convertNodeDataTableToUI(nodeDataTable: DataTable): {
  columns: DataTableColumn[]
  rows: DataTableRow[]
} {
  // Convert columns
  const columns: DataTableColumn[] = nodeDataTable.spec.columns.map(col => ({
    name: col.name,
    type: col.type
  }))

  // Convert rows
  const rows: DataTableRow[] = []
  nodeDataTable.forEach(row => {
    const uiRow: DataTableRow = {}
    row.cells.forEach((cell, index) => {
      const columnName = nodeDataTable.spec.columns[index]?.name
      if (columnName) {
        uiRow[columnName] = cell.getValue()
      }
    })
    rows.push(uiRow)
  })

  return { columns, rows }
}

// Specialized component for node data tables
export interface NodeDataTableProps {
  // Node data
  dataTable: DataTable | null
  
  // Display options
  title?: string
  description?: string
  rowsPerPage?: number
  
  // Row styling
  onRowClick?: (row: DataTableRow, index: number, originalRow: DataRow) => void
  getRowClassName?: (row: DataTableRow, index: number, originalRow: DataRow) => string
  getCellClassName?: (value: any, column: ColumnSpec, row: DataTableRow, cell: Cell) => string
  
  // Cell rendering with access to original cell
  renderCell?: (value: any, column: ColumnSpec, row: DataTableRow, cell: Cell) => React.ReactNode
  
  // Empty state
  emptyMessage?: string
  noDataMessage?: string
  
  // Loading state
  isLoading?: boolean
}

export function NodeDataTable({
  dataTable,
  title,
  description,
  rowsPerPage = 10,
  onRowClick,
  getRowClassName,
  getCellClassName,
  renderCell,
  emptyMessage = "No matching data found",
  noDataMessage = "No data loaded",
  isLoading = false
}: NodeDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  // Convert node data table to UI format
  const { columns, rows } = React.useMemo(() => {
    if (!dataTable) {
      return { columns: [], rows: [] }
    }
    return convertNodeDataTableToUI(dataTable)
  }, [dataTable])

  // Store original data rows for callbacks
  const originalRows = React.useMemo(() => {
    if (!dataTable) return []
    const rows: DataRow[] = []
    dataTable.forEach(row => rows.push(row))
    return rows
  }, [dataTable])

  // Create column definitions for react-table
  const columnDefs: ColumnDef<DataTableRow>[] = React.useMemo(() => {
    return columns.map((column): ColumnDef<DataTableRow> => ({
      accessorKey: column.name,
      header: ({ column: col }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => col.toggleSorting(col.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                {column.name}
                <ArrowUpDown className="h-4 w-4" />
              </div>
              {column.type && (
                <span className="text-xs text-muted-foreground font-normal">
                  {column.type}
                </span>
              )}
            </div>
          </Button>
        )
      },
      cell: ({ row, getValue }) => {
        const value = getValue()
        const rowIndex = row.index
        const originalRow = originalRows[rowIndex]
        
        // Use custom cell renderer if provided
        if (renderCell && dataTable && originalRow) {
          const columnSpec = dataTable.spec.columns.find(col => col.name === column.name)
          if (columnSpec) {
            const columnIndex = dataTable.spec.findColumnIndex(column.name)
            if (columnIndex >= 0) {
              const cell = originalRow.getCell(columnIndex)
              return renderCell(value, columnSpec, row.original, cell)
            }
          }
        }
        
        // Default rendering
        if (value == null || value === '') {
          return (
            <span className="text-muted-foreground italic text-xs">(empty)</span>
          )
        }
        
        return (
          <div className="truncate max-w-48" title={String(value)}>
            {String(value)}
          </div>
        )
      },
    }))
  }, [columns, originalRows, dataTable, renderCell])

  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: {
        pageSize: rowsPerPage,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  // Handle no data state
  if (!dataTable) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading data...</div>
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="text-lg font-medium">No Data Available</div>
          <div className="text-sm text-muted-foreground">
            {noDataMessage}
          </div>
        </div>
      </div>
    )
  }

  // Enhanced title and description
  const enhancedTitle = title || "Data Table"
  const enhancedDescription = description || (
    dataTable ? `${dataTable.size} rows × ${dataTable.spec.columns.length} columns` : undefined
  )

  return (
    <div className="w-full">
      {/* Header */}
      {(enhancedTitle || enhancedDescription) && (
        <div className="border-b p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{enhancedTitle}</h3>
              {enhancedDescription && (
                <div className="text-sm text-muted-foreground">{enhancedDescription}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter data..."
          value={(table.getColumn(columns[0]?.name)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(columns[0]?.name)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const originalRow = originalRows[row.index]
                const rowClassName = getRowClassName ? 
                  getRowClassName(row.original, row.index, originalRow) : ''
                
                return (
                  <TableRow
                    key={row.id}
                    className={rowClassName}
                    onClick={onRowClick && originalRow ? 
                      () => onRowClick(row.original, row.index, originalRow) : 
                      undefined
                    }
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const cellClassName = getCellClassName && dataTable && originalRow ? (() => {
                        const columnSpec = dataTable.spec.columns.find(col => col.name === cell.column.id)
                        if (columnSpec) {
                          const columnIndex = dataTable.spec.findColumnIndex(cell.column.id)
                          if (columnIndex >= 0) {
                            const originalCell = originalRow.getCell(columnIndex)
                            return getCellClassName(cell.getValue(), columnSpec, row.original, originalCell)
                          }
                        }
                        return ''
                      })() : ''
                      
                      return (
                        <TableCell key={cell.id} className={cellClassName}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnDefs.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredRowModel().rows.length} row(s) total.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

// Helper hook for working with node data tables
export function useNodeDataTable(dataTable: DataTable | null) {
  return React.useMemo(() => {
    if (!dataTable) {
      return {
        columns: [],
        rows: [],
        size: 0,
        isEmpty: true
      }
    }

    const { columns, rows } = convertNodeDataTableToUI(dataTable)
    
    return {
      columns,
      rows,
      size: dataTable.size,
      isEmpty: dataTable.size === 0,
      originalDataTable: dataTable
    }
  }, [dataTable])
} 