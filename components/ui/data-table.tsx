import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SearchIcon } from "@/components/icons"

export interface DataTableColumn {
  name: string
  type?: string
}

export interface DataTableRow {
  [key: string]: any
}

export interface DataTableProps {
  // Data
  columns: DataTableColumn[]
  rows: DataTableRow[]
  
  // Display options
  title?: string
  description?: string
  rowsPerPage?: number
  showSearch?: boolean
  showSorting?: boolean
  showPagination?: boolean
  maxHeight?: string
  
  // Search and filtering
  searchPlaceholder?: string
  onSearch?: (term: string) => void
  
  // Row styling
  onRowClick?: (row: DataTableRow, index: number) => void
  getRowClassName?: (row: DataTableRow, index: number) => string
  getCellClassName?: (value: any, column: DataTableColumn, row: DataTableRow) => string
  
  // Cell rendering
  renderCell?: (value: any, column: DataTableColumn, row: DataTableRow) => React.ReactNode
  
  // Empty state
  emptyMessage?: string
  
  // Loading state
  isLoading?: boolean
}

export function DataTable({
  columns,
  rows,
  title,
  description,
  rowsPerPage = 50,
  showSearch = true,
  showSorting = true,
  showPagination = true,
  maxHeight = "calc(100vh - 300px)",
  searchPlaceholder = "Search data...",
  onSearch,
  onRowClick,
  getRowClassName,
  getCellClassName,
  renderCell,
  emptyMessage = "No data to display",
  isLoading = false
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
    onSearch?.(value)
  }

  // Process and filter data
  const processedData = useMemo(() => {
    let filtered = rows

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(col => 
          String(row[col.name] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        
        // Try numeric comparison first
        const aNum = Number(aVal)
        const bNum = Number(bVal)
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortOrder === "asc" ? aNum - bNum : bNum - aNum
        } else {
          // String comparison
          const aStr = String(aVal).toLowerCase()
          const bStr = String(bVal).toLowerCase()
          return sortOrder === "asc" 
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr)
        }
      })
    }

    return filtered
  }, [rows, columns, searchTerm, sortColumn, sortOrder])

  // Pagination
  const paginatedData = useMemo(() => {
    if (!showPagination) return processedData
    
    const startIndex = (currentPage - 1) * rowsPerPage
    return processedData.slice(startIndex, startIndex + rowsPerPage)
  }, [processedData, currentPage, rowsPerPage, showPagination])

  const totalPages = Math.ceil(processedData.length / rowsPerPage)

  // Handle column header click for sorting
  const handleColumnClick = (columnName: string) => {
    if (!showSorting) return
    
    if (sortColumn === columnName) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(columnName)
      setSortOrder("asc")
    }
  }

  // Default cell renderer
  const defaultRenderCell = (value: any, column: DataTableColumn, row: DataTableRow) => {
    const stringValue = String(value || '')
    
    if (stringValue === '' || value === null || value === undefined) {
      return (
        <span className="text-muted-foreground italic text-xs">
          (empty)
        </span>
      )
    }
    
    return (
      <div className="truncate max-w-48" title={stringValue}>
        {stringValue}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (columns.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="text-lg font-medium">No Columns Defined</div>
          <div className="text-sm text-muted-foreground">
            The data table has no columns to display
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {(title || description || showSearch) && (
        <div className="border-b p-4 space-y-4">
          {(title || description) && (
            <div className="flex justify-between items-start">
              <div>
                {title && <h3 className="font-medium">{title}</h3>}
                {description && (
                  <div className="text-sm text-muted-foreground">{description}</div>
                )}
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{processedData.length} rows</Badge>
                <Badge variant="secondary">{columns.length} columns</Badge>
              </div>
            </div>
          )}

          {/* Search and Controls */}
          {showSearch && (
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <SearchIcon size={16} />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-64"
                />
              </div>

              {showSorting && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="sort-column">Sort by:</Label>
                  <Select 
                    value={sortColumn || "none"} 
                    onValueChange={(value) => setSortColumn(value === "none" ? "" : value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No sorting</SelectItem>
                      {columns.map(column => (
                        <SelectItem key={column.name} value={column.name}>
                          {column.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {sortColumn && (
                    <Select 
                      value={sortOrder} 
                      onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">↑ Asc</SelectItem>
                        <SelectItem value="desc">↓ Desc</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto" style={{ maxHeight }}>
        <ScrollArea className="h-full">
          <div className="relative">
            {/* Table Headers */}
            <div className="sticky top-0 bg-background border-b z-10">
              <div className="flex min-w-max">
                {columns.map((column, index) => (
                  <div
                    key={`header-${index}-${column.name}`}
                    className={`px-4 py-3 text-sm font-medium text-muted-foreground border-r last:border-r-0 min-w-32 ${
                      showSorting ? 'cursor-pointer hover:bg-muted/50' : ''
                    }`}
                    onClick={() => handleColumnClick(column.name)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span>{column.name}</span>
                        {column.type && (
                          <span className="text-xs text-muted-foreground font-normal">
                            {column.type}
                          </span>
                        )}
                      </div>
                      {showSorting && sortColumn === column.name && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Rows */}
            <div>
              {paginatedData.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                paginatedData.map((row, rowIndex) => {
                  const actualIndex = showPagination ? (currentPage - 1) * rowsPerPage + rowIndex : rowIndex
                  const rowClassName = getRowClassName ? getRowClassName(row, actualIndex) : ''
                  
                  return (
                    <div 
                      key={`row-${currentPage}-${rowIndex}`} 
                      className={`flex min-w-max border-b hover:bg-muted/30 ${
                        onRowClick ? 'cursor-pointer' : ''
                      } ${rowClassName}`}
                      onClick={() => onRowClick?.(row, actualIndex)}
                    >
                      {columns.map((column, cellIndex) => {
                        const cellValue = row[column.name]
                        const cellClassName = getCellClassName ? getCellClassName(cellValue, column, row) : ''
                        const cellContent = renderCell ? 
                          renderCell(cellValue, column, row) : 
                          defaultRenderCell(cellValue, column, row)
                        
                        return (
                          <div
                            key={`cell-${rowIndex}-${cellIndex}`}
                            className={`px-4 py-3 text-sm border-r last:border-r-0 min-w-32 ${cellClassName}`}
                          >
                            {cellContent}
                          </div>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="border-t p-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, processedData.length)} of {processedData.length} rows
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm">Page</span>
              <Select
                value={String(currentPage)}
                onValueChange={(value) => setCurrentPage(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm">of {totalPages}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 