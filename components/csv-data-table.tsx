"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DownloadIcon, FilterIcon, SearchIcon } from "@/components/icons"
import { parse } from "papaparse"
import { toast } from "sonner"

interface CsvDataTableProps {
  csvData: string
  tabId: string
  tabTitle: string
  isMainTab?: boolean
  onUpdateTab: (tabId: string, newData: string, newTitle?: string) => void
  onCreateNewTab: (title: string, data: string, sourceTabId?: string) => void
}

export function CsvDataTable({ 
  csvData, 
  tabId, 
  tabTitle, 
  isMainTab, 
  onUpdateTab, 
  onCreateNewTab 
}: CsvDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterColumn, setFilterColumn] = useState<string>("")
  const [sortColumn, setSortColumn] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 100
  
  // Filter dialog state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [filterDialogColumn, setFilterDialogColumn] = useState("")
  const [filterDialogOperator, setFilterDialogOperator] = useState<string>("contains")
  const [filterDialogValue, setFilterDialogValue] = useState("")
  
  // Aggregate dialog state
  const [aggregateDialogOpen, setAggregateDialogOpen] = useState(false)
  const [aggregateGroupBy, setAggregateGroupBy] = useState("")
  const [aggregateValueColumn, setAggregateValueColumn] = useState("")
  const [aggregateOperation, setAggregateOperation] = useState("sum")
  
  // Force re-render key to help with tab switching issues
  const [renderKey, setRenderKey] = useState(0)

  // Track changes to csvData prop and reset state for new tabs
  useEffect(() => {
    // Reset state when switching to a new tab or when data changes
    setSearchTerm("");
    setFilterColumn("");
    setSortColumn("");
    setSortOrder("asc");
    setCurrentPage(1);
    setFilterDialogOpen(false);
    setAggregateDialogOpen(false);
    
    // Force re-render to help with any reconciliation issues
    setRenderKey(prev => prev + 1);
  }, [csvData, tabId]);

  // Parse CSV data
  const parsedData = useMemo(() => {
    if (!csvData.trim()) {
      return { headers: [], data: [] };
    }

    try {
      const parsed = parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
      })

      const result = {
        headers: parsed.meta.fields || [],
        data: parsed.data as Record<string, string>[],
      };

      if (result.headers.length === 0) {
        return { headers: [], data: [] }
      }

      return result;
    } catch (error) {
      return { headers: [], data: [] }
    }
  }, [csvData, tabId, tabTitle])

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = parsedData.data

    // Apply search filter
    if (searchTerm) {
      const beforeSearch = filtered.length;
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filter
    if (filterColumn) {
      // This could be enhanced with specific filter operations
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        
        const aNum = Number(aVal)
        const bNum = Number(bVal)
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortOrder === "asc" ? aNum - bNum : bNum - aNum
        } else {
          const aStr = String(aVal).toLowerCase()
          const bStr = String(bVal).toLowerCase()
          return sortOrder === "asc" 
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr)
        }
      })
    }

    return filtered
  }, [parsedData.data, searchTerm, filterColumn, sortColumn, sortOrder, tabId, tabTitle])

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const paginated = processedData.slice(startIndex, startIndex + rowsPerPage)
    
    return paginated
  }, [processedData, currentPage, tabId, tabTitle])

  const totalPages = Math.ceil(processedData.length / rowsPerPage)

  // Get numeric columns for tools
  const numericColumns = useMemo(() => {
    return parsedData.headers.filter(header => {
      const values = parsedData.data.map(row => row[header]).filter(v => v != null && v !== '')
      const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v))
      return numericValues.length > values.length * 0.8
    })
  }, [parsedData])

  // Download CSV
  const downloadCsv = () => {
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tabTitle.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV downloaded successfully')
  }

  // Copy CSV to clipboard
  const copyCsv = () => {
    navigator.clipboard.writeText(csvData)
    toast.success('CSV data copied to clipboard')
  }

  // Data processing utilities
  const parseCSV = (csvText: string): { headers: string[], data: Record<string, any>[] } => {
    if (!csvText || !csvText.trim()) {
      return { headers: [], data: [] };
    }
    
    const lines = csvText.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return { headers: [], data: [] };
    }
    
    // Handle CSV with quotes properly
    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Handle escaped quotes ("")
            current += '"';
            i++; // Skip the next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        const value = (values[index] || '').replace(/"/g, '');
        const numValue = Number.parseFloat(value);
        row[header] = Number.isNaN(numValue) ? value : numValue;
      });
      return row;
    });
    
    return { headers, data };
  }

  const dataToCSV = (headers: string[], data: Record<string, any>[]): string => {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        
        // Handle null/undefined values
        if (value === null || value === undefined) {
          return '';
        }
        
        const stringValue = String(value);
        
        // Escape values that contain commas, quotes, or newlines
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      }).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  }

  // Processing behavior: Main tab -> create new tab, Non-main tab -> update in place
  const shouldCreateNewTab = () => {
    return isMainTab;
  }

  // Clean Data function
  const handleCleanData = () => {
    try {
      const { headers, data } = parseCSV(csvData);
      
      let cleanedData = [...data];
      const operations: string[] = [`Started with ${data.length} rows`];
      
      // Remove completely empty rows
      const before = cleanedData.length;
      cleanedData = cleanedData.filter(row => 
        headers.some(h => row[h] !== null && row[h] !== undefined && String(row[h]).trim() !== '')
      );
      if (before !== cleanedData.length) {
        operations.push(`Removed ${before - cleanedData.length} empty rows`);
      }
      
      // Clean each cell
      let cellsCleaned = 0;
      cleanedData = cleanedData.map(row => {
        const cleanedRow: any = {};
        headers.forEach(header => {
          let value = row[header];
          
          if (value === null || value === undefined) {
            cleanedRow[header] = null;
            return;
          }
          
          const originalValue = value;
          value = String(value);
          
          // Trim whitespace
          value = value.trim();
          
          // Fix common encoding issues
          value = value
            .replace(/â€™/g, "'")
            .replace(/â€œ/g, '"')
            .replace(/â€/g, '"')
            .replace(/â€"/g, '—')
            .replace(/Â/g, '');
          
          // Standardize null values
          if (['null', 'NULL', 'nil', 'NIL', 'n/a', 'N/A', 'na', 'NA', '#N/A', '-', ''].includes(value)) {
            value = null;
          }
          
          if (value !== originalValue) {
            cellsCleaned++;
          }
          
          cleanedRow[header] = value;
        });
        return cleanedRow;
      });
      
      operations.push(`Cleaned ${cellsCleaned} cells`);
      
      const cleanedCsv = dataToCSV(headers, cleanedData);
      
      if (shouldCreateNewTab()) {
        // Main tab: create new tab
        onCreateNewTab(`${tabTitle} (Cleaned)`, cleanedCsv, tabId);
      } else {
        // Non-main tab: update in place
        onUpdateTab(tabId, cleanedCsv, `${tabTitle} (Cleaned)`);
      }
      
      toast.success(`Data cleaned successfully! ${operations.join(' → ')}`);
      
    } catch (error) {
      toast.error(`Error cleaning data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Resolve Duplicates function
  const handleResolveDuplicates = () => {
    if (parsedData.headers.length === 0) {
      toast.error('No identifier column available for duplicate detection');
      return;
    }

    const identifierColumn = parsedData.headers[0]; // Use first column as identifier
    
    try {
      const { headers, data } = parseCSV(csvData);
      
      // Analyze duplicates
      const identifierCounts: Record<string, number> = {};
      const duplicateGroups: Record<string, any[]> = {};
      
      data.forEach((row: any) => {
        const id = String(row[identifierColumn]).trim();
        identifierCounts[id] = (identifierCounts[id] || 0) + 1;
        if (!duplicateGroups[id]) duplicateGroups[id] = [];
        duplicateGroups[id].push(row);
      });
      
      const totalEntries = data.length;
      const uniqueEntries = Object.keys(identifierCounts).length;
      const duplicateEntries = totalEntries - uniqueEntries;
      const duplicatePercentage = (duplicateEntries / totalEntries) * 100;
      
      if (duplicatePercentage < 10) {
        toast.info(`Low duplicate rate (${duplicatePercentage.toFixed(1)}%) - no resolution needed`);
        return;
      }
      
      // Identify numeric columns for aggregation
      const numericColumns = headers.filter(header => {
        if (header === identifierColumn) return false;
        const values = data.map((row: any) => row[header]).filter((v: any) => v !== null && v !== undefined);
        const numericValues = values.map((v: any) => Number(v)).filter((v: any) => !Number.isNaN(v));
        return numericValues.length > values.length * 0.8;
      });
      
      // Auto-decide strategy
      const strategy = numericColumns.length >= 2 ? 'aggregate' : 'rename';
      let processedData = data;
      
      if (strategy === 'aggregate') {
        // Aggregate duplicates by summing numeric columns
        processedData = Object.entries(duplicateGroups).map(([id, rows]) => {
          const aggregatedRow: any = { [identifierColumn]: id };
          
          headers.forEach(header => {
            if (header === identifierColumn) return;
            
            if (numericColumns.includes(header)) {
              const values = rows.map(r => Number(r[header])).filter(v => !Number.isNaN(v));
              aggregatedRow[header] = values.reduce((a, b) => a + b, 0);
            } else {
              // Take first non-null value
              const firstValue = rows.find(r => r[header] !== null && r[header] !== undefined)?.[header];
              aggregatedRow[header] = firstValue || '';
            }
          });
          
          return aggregatedRow;
        });
      } else {
        // Rename duplicates with unique suffixes
        const nameCounters: Record<string, number> = {};
        
        processedData = data.map((row: any) => {
          const id = String(row[identifierColumn]).trim();
          const newRow = { ...row };
          
          if (identifierCounts[id] > 1) {
            nameCounters[id] = (nameCounters[id] || 0) + 1;
            const suffix = nameCounters[id];
            newRow[identifierColumn] = `${id}_${suffix}`;
          }
          
          return newRow;
        });
      }
      
      const processedCsv = dataToCSV(headers, processedData);
      
      if (shouldCreateNewTab()) {
        // Main tab: create new tab
        onCreateNewTab(`${tabTitle} (Duplicates Resolved)`, processedCsv, tabId);
      } else {
        // Non-main tab: update in place
        onUpdateTab(tabId, processedCsv, `${tabTitle} (Duplicates Resolved)`);
      }
      
      toast.success(`Duplicates resolved! ${duplicatePercentage.toFixed(1)}% duplicates processed using ${strategy} strategy`);
      
    } catch (error) {
      toast.error(`Error resolving duplicates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Sum Column function
  const handleSumColumn = (column: string) => {
    try {
      const values = parsedData.data.map(row => row[column]).filter(v => v != null && v !== '')
      const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v))
      
      if (numericValues.length === 0) {
        toast.error(`No numeric values found in column '${column}'`)
        return
      }
      
      const sum = numericValues.reduce((a, b) => a + b, 0)
      const count = numericValues.length
      const average = sum / count
      const min = Math.min(...numericValues)
      const max = Math.max(...numericValues)
      
      toast.success(
        `Column '${column}' Analysis:\n` +
        `• Total: ${sum.toLocaleString()}\n` +
        `• Count: ${count.toLocaleString()} values\n` +
        `• Average: ${Math.round(average * 100) / 100}\n` +
        `• Range: ${min} - ${max}`, 
        { duration: 5000 }
      )
      
    } catch (error) {
      toast.error(`Error analyzing column: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Filter Data function
  const handleFilterData = () => {
    if (!filterDialogColumn || !filterDialogValue) {
      toast.error('Please select a column and enter a filter value');
      return;
    }

    try {
      const { headers, data } = parseCSV(csvData);
      
      const filteredData = data.filter((row: any) => {
        const cellValue = row[filterDialogColumn];
        if (cellValue === null || cellValue === undefined) {
          return false;
        }
        
        const cellStr = String(cellValue).toLowerCase();
        const valueStr = filterDialogValue.toLowerCase();
        
        switch (filterDialogOperator) {
          case '>':
            return Number(cellValue) > Number(filterDialogValue);
          case '<':
            return Number(cellValue) < Number(filterDialogValue);
          case '>=':
            return Number(cellValue) >= Number(filterDialogValue);
          case '<=':
            return Number(cellValue) <= Number(filterDialogValue);
          case '==':
            return cellStr === valueStr;
          case '!=':
            return cellStr !== valueStr;
          case 'contains':
            return cellStr.includes(valueStr);
          case 'startsWith':
            return cellStr.startsWith(valueStr);
          case 'endsWith':
            return cellStr.endsWith(valueStr);
          default:
            return false;
        }
      });
      
      const filteredCsv = dataToCSV(headers, filteredData);
      const filterDescription = `${filterDialogColumn} ${filterDialogOperator} ${filterDialogValue}`;
      
      if (shouldCreateNewTab()) {
        // Main tab: create new tab
        onCreateNewTab(`${tabTitle} (Filtered: ${filterDescription})`, filteredCsv, tabId);
      } else {
        // Non-main tab: update in place
        onUpdateTab(tabId, filteredCsv, `${tabTitle} (Filtered)`);
      }
      
      const reductionPercentage = ((data.length - filteredData.length) / data.length * 100).toFixed(1);
      toast.success(`Filter applied! ${data.length} → ${filteredData.length} rows (${reductionPercentage}% reduction)`);
      
      setFilterDialogOpen(false);
      setFilterDialogColumn("");
      setFilterDialogValue("");
      
    } catch (error) {
      toast.error(`Error filtering data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Aggregate Data function
  const handleAggregateData = () => {
    if (!aggregateGroupBy || !aggregateValueColumn) {
      toast.error('Please select both group-by and value columns');
      return;
    }

    try {
      const { headers, data } = parseCSV(csvData);
      
      const groups: Record<string, any[]> = {};
      
      // Group the data
      data.forEach((row: any) => {
        const key = String(row[aggregateGroupBy]);
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      });
      
      // Perform aggregation
      const aggregatedData = Object.entries(groups).map(([key, rows]) => {
        const result: any = { [aggregateGroupBy]: key };
        const values = rows.map(r => Number(r[aggregateValueColumn])).filter(v => !Number.isNaN(v));
        
        switch (aggregateOperation) {
          case 'sum':
            result[`${aggregateValueColumn}_sum`] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            result[`${aggregateValueColumn}_avg`] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            break;
          case 'count':
            result[`${aggregateValueColumn}_count`] = rows.length;
            break;
          case 'min':
            result[`${aggregateValueColumn}_min`] = values.length > 0 ? Math.min(...values) : 0;
            break;
          case 'max':
            result[`${aggregateValueColumn}_max`] = values.length > 0 ? Math.max(...values) : 0;
            break;
        }
        
        return result;
      });
      
      const newHeaders = [aggregateGroupBy, `${aggregateValueColumn}_${aggregateOperation}`];
      const aggregatedCsv = dataToCSV(newHeaders, aggregatedData);
      
      if (shouldCreateNewTab()) {
        // Main tab: create new tab
        onCreateNewTab(`${tabTitle} (Aggregated: ${aggregateOperation} ${aggregateValueColumn} by ${aggregateGroupBy})`, aggregatedCsv, tabId);
      } else {
        // Non-main tab: update in place
        onUpdateTab(tabId, aggregatedCsv, `${tabTitle} (Aggregated)`);
      }
      
      toast.success(`Data aggregated! ${data.length} → ${aggregatedData.length} groups`);
      
      setAggregateDialogOpen(false);
      setAggregateGroupBy("");
      setAggregateValueColumn("");
      
    } catch (error) {
      toast.error(`Error aggregating data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (!parsedData.headers.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <div className="text-lg font-medium">No Data Available</div>
          <div className="text-sm text-muted-foreground">
            No CSV data to display in this tab
          </div>
        </div>
      </div>
    )
  }

  return (
    <div key={`csv-table-${tabId}-${renderKey}`} className="flex flex-col h-full">
      {/* Data Processing Tools Toolbar */}
      <div className="bg-muted/30 border-b p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="font-medium">Data Processing Tools</h3>
            <div className="text-xs text-muted-foreground">
              Tools process real data and update tabs • Click to run directly • Main tab creates copies
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{processedData.length} rows</Badge>
            <Badge variant="secondary">{parsedData.headers.length} columns</Badge>
          </div>
        </div>

        {/* Core Data Processing Tools */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCleanData}
            >
              🧹 Clean Data
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResolveDuplicates}
            >
              🔍 Resolve Duplicates
            </Button>
            
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilterIcon size={16} />
                  Filter Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filter Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="filter-column">Column</Label>
                    <Select value={filterDialogColumn} onValueChange={setFilterDialogColumn}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column to filter" />
                      </SelectTrigger>
                      <SelectContent>
                        {parsedData.headers.map(header => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filter-operator">Operator</Label>
                    <Select value={filterDialogOperator} onValueChange={setFilterDialogOperator}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="==">=Equals</SelectItem>
                        <SelectItem value="!=">Not Equals</SelectItem>
                        <SelectItem value=">">Greater Than</SelectItem>
                        <SelectItem value="<">Less Than</SelectItem>
                        <SelectItem value=">=">Greater or Equal</SelectItem>
                        <SelectItem value="<=">Less or Equal</SelectItem>
                        <SelectItem value="startsWith">Starts With</SelectItem>
                        <SelectItem value="endsWith">Ends With</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filter-value">Value</Label>
                    <Input
                      id="filter-value"
                      value={filterDialogValue}
                      onChange={(e) => setFilterDialogValue(e.target.value)}
                      placeholder="Enter filter value"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setFilterDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleFilterData}>
                      Apply Filter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={aggregateDialogOpen} onOpenChange={setAggregateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  📊 Aggregate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aggregate Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="group-by">Group By Column</Label>
                    <Select value={aggregateGroupBy} onValueChange={setAggregateGroupBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column to group by" />
                      </SelectTrigger>
                      <SelectContent>
                        {parsedData.headers.map(header => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="value-column">Value Column</Label>
                    <Select value={aggregateValueColumn} onValueChange={setAggregateValueColumn}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column to aggregate" />
                      </SelectTrigger>
                      <SelectContent>
                        {numericColumns.map(header => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="operation">Operation</Label>
                    <Select value={aggregateOperation} onValueChange={setAggregateOperation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sum">Sum</SelectItem>
                        <SelectItem value="avg">Average</SelectItem>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="min">Minimum</SelectItem>
                        <SelectItem value="max">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setAggregateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAggregateData}>
                      Aggregate Data
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Column-specific tools */}
          {numericColumns.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center">Quick Sum:</span>
              {numericColumns.slice(0, 5).map(column => (
                <Button 
                  key={column}
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSumColumn(column)}
                >
                  💰 Sum {column}
                </Button>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Table Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <SearchIcon size={16} />
            <Input
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="sort-column">Sort by:</Label>
            <Select value={sortColumn || "none"} onValueChange={(value) => setSortColumn(value === "none" ? "" : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No sorting</SelectItem>
                {parsedData.headers.map(header => (
                  <SelectItem key={header} value={header}>{header}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {sortColumn && (
              <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
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

          <div className="flex gap-2 ml-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                toast.info('💬 Switch to the "Dashboard" tab to see/create charts, or use "createDashboardChart" tool in chat', { duration: 4000 });
              }}
            >
              📊 Create Charts
            </Button>
            <Button variant="outline" size="sm" onClick={copyCsv}>
              📋 Copy
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCsv}>
              <DownloadIcon size={16} />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table using basic table components */}
      <div className="border rounded-lg overflow-auto">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {parsedData.headers.map((header, index) => (
                  <TableHead
                    key={`header-${index}-${header}`}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      sortColumn === header ? 'bg-muted' : ''
                    }`}
                    onClick={() => {
                      if (sortColumn === header) {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      } else {
                        setSortColumn(header)
                        setSortOrder("asc")
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {header}
                      {sortColumn === header && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={parsedData.headers.length} 
                    className="text-center text-muted-foreground p-8"
                  >
                    {searchTerm || filterColumn ? "No matching data found" : "No data to display"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <TableRow key={`row-${currentPage}-${rowIndex}`}>
                    {parsedData.headers.map((header, cellIndex) => {
                      const value = row[header]
                      const stringValue = String(value || '')
                      const isEmpty = stringValue === '' || value === null || value === undefined
                      
                      return (
                        <TableCell
                          key={`cell-${rowIndex}-${cellIndex}`}
                          className={isEmpty ? 'bg-red-50 dark:bg-red-950/20' : ''}
                        >
                          <div 
                            className="truncate max-w-48" 
                            title={stringValue}
                          >
                            {isEmpty ? (
                              <span className="text-muted-foreground italic text-xs">
                                (empty)
                              </span>
                            ) : (
                              stringValue
                            )}
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
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
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
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
    </div>
  )
} 