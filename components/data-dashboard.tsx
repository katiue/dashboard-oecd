"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FullscreenIcon } from "@/components/icons"
import { UnifiedChartRenderer, type ChartType, type ChartConfig } from "@/lib/chart/UnifiedChartRenderer"
import { UnifiedChartConfig } from "@/lib/chart/UnifiedChartConfig"
import { processChartData } from "@/lib/chart/UnifiedChartDataProcessor"
import { parse } from "papaparse"
import { toast } from "sonner"

// Utility function to get key takeaway text
const getKeyTakeaway = (chart: DashboardChartConfig) => {
  // Combine insights and methodology or use visualization + importance
  if (chart.commentary.insights || chart.commentary.methodology) {
    return `${chart.commentary.insights || ""} ${chart.commentary.methodology || ""}`.trim()
  }
  return `${chart.commentary.visualization} ${chart.commentary.importance}`.trim()
}

interface DashboardChartConfig {
  id: string
  title: string
  description: string
  chartType: ChartType
  config: ChartConfig
  commentary: {
    visualization: string
    importance: string
    insights?: string
    methodology?: string
  }
  data?: any[]
}

interface DataDashboardProps {
  csvData?: string
  initialCharts?: DashboardChartConfig[]
}

export function DataDashboard({ csvData: initialCsvData, initialCharts }: DataDashboardProps) {
  const [csvData, setCsvData] = useState(initialCsvData || "")
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [charts, setCharts] = useState<DashboardChartConfig[]>(initialCharts || [])
  const [expandedChart, setExpandedChart] = useState<string | null>(null)

  // Parse CSV data and extract headers
  const parsedData = useMemo(() => {
    if (!csvData.trim()) return { headers: [], data: [] }

    try {
      const parsed = parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
      })

      return {
        headers: parsed.meta.fields || [],
        data: parsed.data as Record<string, string>[],
      }
    } catch (error) {
      console.error("Error parsing CSV data:", error)
      return { headers: [], data: [] }
    }
  }, [csvData])

  // Update headers when data changes
  useEffect(() => {
    setCsvHeaders(parsedData.headers)
  }, [parsedData.headers])

  // Update charts when initialCharts prop changes (new charts from tool)
  useEffect(() => {
    if (initialCharts && initialCharts.length > 0) {
      setCharts((prevCharts) => {
        // Merge existing charts with new ones, avoid duplicates
        const existingIds = new Set(prevCharts.map((chart) => chart.id))
        const newCharts = initialCharts.filter((chart) => !existingIds.has(chart.id))
        return [...prevCharts, ...newCharts]
      })
    }
  }, [initialCharts])

  // Reset generation flag when CSV data changes
  useEffect(() => {
    if (csvData !== initialCsvData) {
      setCharts([])
    }
  }, [csvData, initialCsvData])

  // Process data for charts with filters applied
  const processedChartsData = useMemo(() => {
    if (!charts.length) {
      return []
    }

    return charts.map((chart) => {
      try {
        // If chart already has processed data (from tool), use it
        if (chart.data && Array.isArray(chart.data) && chart.data.length > 0) {
          return chart
        }

        // If no parsed data available, return chart with empty data
        if (!parsedData.data.length) {
          return {
            ...chart,
            data: [],
          }
        }

        const filteredData = parsedData.data

        // Clean and validate the data before processing
        const cleanedData = filteredData.map((row) => {
          const cleanedRow: Record<string, string> = {}
          parsedData.headers.forEach((header) => {
            const value = row[header]
            // Clean the value - remove null, undefined, and clean strings
            if (value !== null && value !== undefined) {
              const stringValue = String(value).trim()
              // Replace empty strings with fallback values
              cleanedRow[header] = stringValue || "0"
            } else {
              cleanedRow[header] = "0"
            }
          })
          return cleanedRow
        })

        // Convert to CSV string for processing
        if (cleanedData.length === 0) {
          return {
            ...chart,
            data: [],
          }
        }

        const headers = `${parsedData.headers.join(",")}\n`
        const dataRows = cleanedData
          .map((row) =>
            parsedData.headers
              .map((header) => {
                const value = row[header] || "0"
                // Escape commas and quotes in CSV
                if (value.includes(",") || value.includes('"')) {
                  return `"${value.replace(/"/g, '""')}"`
                }
                return value
              })
              .join(","),
          )
          .join("\n")
        const csvString = headers + dataRows

        const processedData = processChartData(chart.chartType, csvString, chart.config)

        // Additional validation for the processed data
        const validatedData = Array.isArray(processedData)
          ? processedData
              .map((item) => {
                if (!item || typeof item !== "object") {
                  return null
                }

                // Clean numeric values
                const cleanedItem: any = {}
                Object.keys(item).forEach((key) => {
                  const value = item[key]
                  if (typeof value === "number") {
                    // Ensure no NaN, Infinity, or invalid numbers
                    cleanedItem[key] = Number.isFinite(value) ? value : 0
                  } else if (typeof value === "string") {
                    // Ensure strings are not empty and properly trimmed
                    cleanedItem[key] = value.trim() || "Unknown"
                  } else {
                    cleanedItem[key] = value
                  }
                })

                return cleanedItem
              })
              .filter(Boolean)
          : []

        return {
          ...chart,
          data: validatedData,
        }
      } catch (error) {
        console.error(`Error processing chart ${chart.id}:`, error)
        return {
          ...chart,
          data: [],
        }
      }
    })
  }, [charts, parsedData])

  // Toggle chart full screen
  const toggleFullScreen = (chartId: string) => {
    setExpandedChart((prev) => (prev === chartId ? null : chartId))
  }

  if (!csvData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Data Visualization Dashboard</h2>
        <div className="text-muted-foreground mb-4">No data available</div>
      </div>
    )
  }

  if (expandedChart) {
    const chart = processedChartsData.find((c) => c.id === expandedChart)
    if (chart) {
      return (
        <FullScreenChartView
          chart={chart}
          onClose={() => setExpandedChart(null)}
          onConfigChange={(updatedChart) => {
            setCharts((prev) => prev.map((c) => (c.id === updatedChart.id ? updatedChart : c)))
          }}
        />
      )
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Visualization Dashboard</h1>
          <div className="text-muted-foreground">
            Interactive analysis of your data with {charts.length} visualizations
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{parsedData.data.length} records</Badge>
          <Badge variant="secondary">{parsedData.headers.length} columns</Badge>
        </div>
      </div>

      {/* Note: Data Processing Tools are now available in CSV tabs only */}

      {/* Charts Grid */}
      {processedChartsData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {processedChartsData.map((chart) => (
            <Card key={chart.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{chart.title}</CardTitle>
                    <div className="text-sm text-muted-foreground">{chart.description}</div>
                    <Badge variant="outline" className="mt-2">
                      {chart.chartType}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toggleFullScreen(chart.id)} className="p-2">
                      <FullscreenIcon size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Chart Visualization */}
                <div className="h-80 mb-4" data-chart-id={chart.id}>
                  {chart.data && Array.isArray(chart.data) && chart.data.length > 0 ? (
                    <UnifiedChartRenderer chartType={chart.chartType} data={chart.data} config={chart.config} />
                  ) : (
                    <div className="flex size-full items-center justify-center border border-dashed rounded">
                      <div className="text-muted-foreground">No data available</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 space-y-4">
          <div className="text-muted-foreground">
            No charts available for this data yet.
          </div>
          {csvData && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                📊 Ready to create visualizations from your {parsedData.data.length.toLocaleString()} rows of data
              </div>
              <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3 max-w-md mx-auto">
                💬 In chat, use: <br/>
                <code className="text-xs bg-background px-1 rounded">
                  &quot;Create charts for this data&quot;
                </code> <br/>
                or <br/>
                <code className="text-xs bg-background px-1 rounded">
                  &quot;createDashboardChart&quot;
                </code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Full Screen Chart View Component
function FullScreenChartView({
  chart,
  onClose,
  onConfigChange,
}: {
  chart: DashboardChartConfig
  onClose: () => void
  onConfigChange: (chart: DashboardChartConfig) => void
}) {
  const [activePanel, setActivePanel] = useState<"config" | "data">("config")

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{chart.title}</h2>
            <p className="text-muted-foreground">{chart.description}</p>
            {/* Show processing info if available */}
            {(chart as any).metadata?.originalSource && (
              <div className="text-xs text-muted-foreground mt-1">
                Source: {(chart as any).metadata.originalSource} | Processed: {(chart as any).metadata.dataShape?.[0]}{" "}
                rows × {(chart as any).metadata.dataShape?.[1]} cols
              </div>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Main Content Area - Split Layout with Scrolling */}
        <div className="flex flex-1 overflow-auto">
          {/* Chart Area - Left Side */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="min-h-full" data-chart-id={`fullscreen-${chart.id}`}>
              {chart.data && Array.isArray(chart.data) && chart.data.length > 0 ? (
                <div className="h-96 min-h-96 mb-6">
                  <UnifiedChartRenderer chartType={chart.chartType} data={chart.data} config={chart.config} />
                </div>
              ) : (
                <div className="flex h-96 w-full items-center justify-center border border-dashed rounded mb-6">
                  <div className="text-muted-foreground">No data available</div>
                </div>
              )}

              {/* Enhanced Key Takeaway and Processing Info */}
              <div className="space-y-4">
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-semibold mb-2">Key Takeaway</h4>
                  <div className="text-sm text-muted-foreground">{getKeyTakeaway(chart)}</div>
                </Card>

                {/* Processing Steps if available */}
                {(chart as any).processingSteps && (
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Data Processing Pipeline</h4>
                    <div className="text-sm space-y-1">
                      {(chart as any).processingSteps.map((step: string, index: number) => (
                        <div key={`step-${index}-${step.slice(0, 20)}`} className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <span className="size-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Statistical Analysis if available */}
                {(chart as any).statisticalAnalysis && (
                  <Card className="p-4 bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Statistical Insights</h4>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {(chart as any).statisticalAnalysis.summary?.join(". ") || "Statistical analysis completed."}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Panel - Configuration and Data */}
          <div className="w-80 border-l bg-muted overflow-auto flex flex-col">
            {/* Panel Tabs */}
            <Tabs
              value={activePanel}
              onValueChange={(value) => setActivePanel(value as "config" | "data")}
              className="flex flex-col h-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
              </TabsList>

              {/* Panel Content */}
              <TabsContent value="config" className="flex-1 overflow-auto">
                <ScrollArea className="h-full p-4">
                  <ChartConfigPanel chart={chart} onChange={onConfigChange} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="data" className="flex-1 overflow-auto">
                <ScrollArea className="h-full p-4">
                  <CsvDataPanel chart={chart} />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

// CSV Data Panel Component
function CsvDataPanel({ chart }: { chart: DashboardChartConfig }) {
  const [searchTerm, setSearchTerm] = useState("")

  // Get CSV data from enhanced chart or convert existing data
  const csvData = (chart as any).processedCsvData || convertDataToCsv(chart.data || [])
  const lines = csvData.split("\n").filter((line: string) => line.trim())
  const headers = lines[0]?.split(",") || []
  const dataRows = lines.slice(1)

  // Filter data based on search term
  const filteredRows = searchTerm
    ? dataRows.filter((row: string) => row.toLowerCase().includes(searchTerm.toLowerCase()))
    : dataRows

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Processed Data</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {dataRows.length} rows × {headers.length} columns
        </p>

        {/* Search */}
        <Input
          placeholder="Search data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
      </div>

      {/* Data Table */}
      <Card>
        {/* Headers */}
        <div className="bg-muted/50 border-b overflow-x-auto">
          <div className="flex min-w-max">
            {headers.map((header: string) => (
              <div
                key={`header-${header}`}
                className="px-3 py-2 text-xs font-medium text-muted-foreground border-r last:border-r-0 min-w-24"
              >
                {header.replace(/"/g, "")}
              </div>
            ))}
          </div>
        </div>

        {/* Data Rows */}
        <ScrollArea className="max-h-96">
          {filteredRows.slice(0, 100).map((row: string, rowIndex: number) => {
            const cells = row.split(",")
            return (
              <div key={`row-${rowIndex}-${cells[0]?.slice(0, 10) || rowIndex}`} className="flex min-w-max border-b last:border-b-0 hover:bg-muted/30">
                {cells.map((cell: string, cellIndex: number) => (
                  <div
                    key={`cell-${rowIndex}-${cellIndex}-${cell.slice(0, 10)}`}
                    className="px-3 py-2 text-xs border-r last:border-r-0 min-w-24"
                    title={cell.replace(/"/g, "")}
                  >
                    <div className="truncate">{cell.replace(/"/g, "")}</div>
                  </div>
                ))}
              </div>
            )
          })}
        </ScrollArea>

        {/* Show more indicator */}
        {filteredRows.length > 100 && (
          <div className="p-2 text-center text-xs text-muted-foreground bg-muted/30">
            Showing first 100 rows of {filteredRows.length} filtered results
          </div>
        )}
      </Card>

      {/* Data Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(csvData)
            toast.success("CSV data copied to clipboard")
          }}
        >
          Copy CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const blob = new Blob([csvData], { type: "text/csv" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${chart.title.replace(/\s+/g, "_")}_data.csv`
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          Download CSV
        </Button>
      </div>

      {/* Processing Metadata */}
      {(chart as any).metadata && (
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Processing Metadata</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>Original Source: {(chart as any).metadata.originalSource}</div>
            <div>Processed: {(chart as any).metadata.processedAt}</div>
            <div>
              Shape: {(chart as any).metadata.dataShape?.[0]} × {(chart as any).metadata.dataShape?.[1]}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to convert data to CSV if not available
function convertDataToCsv(data: any[]): string {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return ""
  }

  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(",")
  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header]
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`
        }
        return value
      })
      .join(","),
  )

  return [csvHeaders, ...csvRows].join("\n")
}

// Chart Configuration Panel Component - Now using UnifiedChartConfig
function ChartConfigPanel({
  chart,
  onChange,
}: {
  chart: DashboardChartConfig
  onChange: (chart: DashboardChartConfig) => void
}) {
  const [localConfig, setLocalConfig] = useState<ChartConfig>(chart.config)

  const updateConfig = (updates: Partial<typeof localConfig>) => {
    const newConfig = { ...localConfig, ...updates } as ChartConfig
    setLocalConfig(newConfig)
    onChange({ ...chart, config: newConfig })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Chart Configuration</h3>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={chart.title} onChange={(e) => onChange({ ...chart, title: e.target.value })} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={chart.description}
          onChange={(e) => onChange({ ...chart, description: e.target.value })}
        />
      </div>

      {/* Color Scheme */}
      <div className="space-y-2">
        <Label htmlFor="colorScheme">Color Scheme</Label>
        <Select
          value={
            typeof localConfig.colors === "object" && !Array.isArray(localConfig.colors) && localConfig.colors?.scheme
              ? localConfig.colors.scheme
              : "nivo"
          }
          onValueChange={(value) =>
            updateConfig({
              colors: {
                scheme: value as any,
              },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nivo">Nivo</SelectItem>
            <SelectItem value="category10">Category 10</SelectItem>
            <SelectItem value="accent">Accent</SelectItem>
            <SelectItem value="dark2">Dark 2</SelectItem>
            <SelectItem value="paired">Paired</SelectItem>
            <SelectItem value="pastel1">Pastel 1</SelectItem>
            <SelectItem value="pastel2">Pastel 2</SelectItem>
            <SelectItem value="set1">Set 1</SelectItem>
            <SelectItem value="set2">Set 2</SelectItem>
            <SelectItem value="set3">Set 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Use UnifiedChartConfig for chart-specific configurations */}
      <UnifiedChartConfig
        chartType={chart.chartType as ChartType}
        config={localConfig}
        onChange={updateConfig}
      />
    </div>
  )
}
