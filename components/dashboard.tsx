"use client"

import React, { useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useWindowSize } from "usehooks-ts"
import { CrossIcon, TableIcon, ChartBarIcon, MenuIcon } from "./icons"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { DataDashboard } from "./data-dashboard"
import { CsvDataTable } from "./csv-data-table"
import { WorkflowEditor } from "./workflow-editor"
import { useSidebar } from "./ui/sidebar"
import { processChartData } from "@/lib/chart/UnifiedChartDataProcessor"
import { updateDashboardTabs, type DashboardTabInfo } from '@/lib/ai/csv-transform'

export interface DashboardState {
  isVisible: boolean
  csvData: string
  dashboardData?: any
  boundingBox: {
    top: number
    left: number
    width: number
    height: number
  }
}

interface CsvTab {
  id: string
  title: string
  csvData: string
  isMain?: boolean // If this is the original CSV
}

interface DashboardTab {
  id: string
  title: string
  charts: any[]
  csvData?: string
}

interface WorkflowTab {
  id: string
  title: string
  workflowData?: any
}

interface DashboardProps {
  isVisible: boolean
  csvData: string
  dashboardData?: any
  boundingBox: {
    top: number
    left: number
    width: number
    height: number
  }
  onClose: () => void
}

function Dashboard({ isVisible, csvData, dashboardData, boundingBox, onClose }: DashboardProps) {
  const { width: windowWidth, height: windowHeight } = useWindowSize()
  const { state: sidebarState } = useSidebar()
  const isSidebarOpen = sidebarState === "expanded"
  const isMobile = windowWidth ? windowWidth < 768 : false

  // State for managing tabs
  const [activeTab, setActiveTab] = useState<string>("dashboard-1")
  const [csvTabs, setCsvTabs] = useState<CsvTab[]>([])
  const [dashboardTabs, setDashboardTabs] = useState<DashboardTab[]>([
    { id: "dashboard-1", title: "Dashboard", charts: [], csvData: csvData },
  ])
  const [workflowTabs, setWorkflowTabs] = useState<WorkflowTab[]>([
    { id: "workflow-1", title: "Data Workflow", workflowData: null },
  ])

  // Debug active tab changes
  React.useEffect(() => {
    // Active tab changed
  }, [activeTab, csvTabs.length, csvTabs])

  // Initialize CSV tab if we have CSV data
  React.useEffect(() => {
    if (csvData && csvData.includes(",") && csvData.includes("\n") && csvTabs.length === 0) {
      const newCsvTab: CsvTab = {
        id: "csv-main",
        title: "Main Data",
        csvData: csvData,
        isMain: true,
      }
      setCsvTabs([newCsvTab])
      setActiveTab("csv-main") // Switch to CSV tab when data is loaded
    }
  }, [csvData, csvTabs.length])

  // Update dashboard charts when dashboardData changes
  React.useEffect(() => {
    if (dashboardData?.charts && dashboardData.charts.length > 0) {
      setDashboardTabs((prev) =>
        prev.map((tab) =>
          tab.id === "dashboard-1"
            ? { ...tab, charts: dashboardData.charts, csvData: dashboardData.csvData || csvData }
            : tab,
        ),
      )
    }
  }, [dashboardData, csvData])

  // Add new CSV tab (for tool results)
  const addCsvTab = useCallback(
    (title: string, data: string, sourceTabId?: string) => {
      const newId = `csv-${Date.now()}`
      const newTab: CsvTab = {
        id: newId,
        title,
        csvData: data,
      }
      setCsvTabs((prev) => {
        const newTabs = [...prev, newTab]
        return newTabs
      })

      // Update the main dashboard tab with the new data (don't create separate dashboard tabs)
      setDashboardTabs((prev) => prev.map((tab) => (tab.id === "dashboard-1" ? { ...tab, csvData: data } : tab)))

      // Use setTimeout to ensure state is updated before changing active tab
      setTimeout(() => {
        setActiveTab(newId)
      }, 10)
    },
    [activeTab, csvTabs.length],
  )

  // Update existing CSV tab (for in-place transformations)
  const updateCsvTab = useCallback((tabId: string, newData: string, newTitle?: string) => {
    setCsvTabs((prev) => {
      const updatedTabs = prev.map((tab) =>
        tab.id === tabId ? { ...tab, csvData: newData, title: newTitle || tab.title } : tab,
      )
      return updatedTabs
    })

    // Find the updated tab to get its title
    const updatedTab = csvTabs.find(tab => tab.id === tabId)
    if (updatedTab) {
      const oldTabTitle = updatedTab.title
      const newTabTitle = newTitle || updatedTab.title
      
      // Update charts that use this tab as their source
      setDashboardTabs((prev) => prev.map((dashTab) => {
        if (dashTab.id === "dashboard-1") {
          const updatedCharts = dashTab.charts.map((chart) => {
            // Check if this chart uses the updated tab as its source (check both old and new titles)
            const isSourceTab = chart.metadata?.sourceTab === oldTabTitle || chart.metadata?.sourceTab === newTabTitle
            if (isSourceTab) {
              console.log(`Updating chart "${chart.title}" with new data from tab "${newTabTitle}"`)
              
              try {
                // Regenerate chart with new data
                const lines = newData.trim().split('\n')
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
                const data = lines.slice(1).map(line => {
                  const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
                  const row: Record<string, any> = {}
                  headers.forEach((header, index) => {
                    const value = values[index] || ''
                    const numValue = Number.parseFloat(value)
                    row[header] = Number.isNaN(numValue) ? value : numValue
                  })
                  return row
                })

                // Apply the same processing steps that were used originally
                let processedData = data
                if (chart.processingSteps) {
                  // Apply original processing if stored
                  // For now, we'll regenerate with current data as-is
                  // This could be enhanced to reapply original transformations
                }

                // Regenerate chart data with the same configuration
                let chartFormattedData: any[]
                try {
                  const processedCsvHeaders = headers.join(',')
                  const processedCsvRows = processedData.map(row => 
                    headers.map(h => {
                      const value = row[h]
                      if (typeof value === 'string' && value.includes(',')) {
                        return `"${value}"`
                      }
                      return value
                    }).join(',')
                  )
                  const processedCsvData = [processedCsvHeaders, ...processedCsvRows].join('\n')
                  
                  chartFormattedData = processChartData(chart.chartType as any, processedCsvData, chart.config as any)
                } catch (error) {
                  console.error('Error reprocessing chart data:', error)
                  chartFormattedData = processedData
                }

                // Return updated chart with new data
                return {
                  ...chart,
                  data: chartFormattedData,
                  metadata: {
                    ...chart.metadata,
                    sourceTab: newTabTitle, // Update to new tab title
                    processedAt: new Date().toISOString(),
                    dataShape: [processedData.length, headers.length],
                  },
                  commentary: {
                    ...chart.commentary,
                    methodology: chart.commentary.methodology?.replace(/Data sourced from .* tab/, `Data sourced from ${newTabTitle} tab (auto-updated)`)
                  }
                }
              } catch (error) {
                console.error('Error updating chart with new data:', error)
                return chart // Return original chart if update fails
              }
            }
            return chart // Return unchanged chart if not using this tab
          })

          return { ...dashTab, charts: updatedCharts, csvData: newData }
        }
        return dashTab
      }))
    } else {
      // Fallback: just update the main dashboard tab data
      setDashboardTabs((prev) => prev.map((tab) => (tab.id === "dashboard-1" ? { ...tab, csvData: newData } : tab)))
    }
  }, [csvTabs])

  // Create chart from tab data
  const createChartFromTab = useCallback(async (chartConfig: any) => {
    const { chartId, sourceTab, chartType, title, description, parameters } = chartConfig
    
    // Find the source tab
    const sourceTabData = csvTabs.find(tab => tab.title === sourceTab)
    if (!sourceTabData) {
      console.error("Source tab not found:", sourceTab)
      return
    }

    try {
      // Parse CSV data and create chart configuration (simplified version of the logic from the tool)
      const lines = sourceTabData.csvData.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: Record<string, any> = {}
        headers.forEach((header, index) => {
          const value = values[index] || ''
          const numValue = Number.parseFloat(value)
          row[header] = Number.isNaN(numValue) ? value : numValue
        })
        return row
      })

      let processedData = data
      const processingSteps: string[] = [`Loaded ${data.length} rows from ${sourceTab} tab`]

      // Apply processing steps if specified
      if (parameters.removeNulls) {
        const initialCount = processedData.length
        processedData = processedData.filter(row => 
          headers.every(header => 
            row[header] !== null && row[header] !== undefined && row[header] !== ''
          )
        )
        const removed = initialCount - processedData.length
        if (removed > 0) {
          processingSteps.push(`Removed ${removed} rows with null values`)
        }
      }

      if (parameters.limitRows && parameters.limitRows < processedData.length) {
        processedData = processedData.slice(0, parameters.limitRows)
        processingSteps.push(`Limited to first ${parameters.limitRows} rows`)
      }

      if (parameters.sortBy && headers.includes(parameters.sortBy)) {
        processedData.sort((a, b) => {
          const aVal = a[parameters.sortBy]
          const bVal = b[parameters.sortBy]
          
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return parameters.sortOrder === 'desc' ? bVal - aVal : aVal - bVal
          } else {
            const aStr = String(aVal).toLowerCase()
            const bStr = String(bVal).toLowerCase()
            if (parameters.sortOrder === 'desc') {
              return bStr.localeCompare(aStr)
            } else {
              return aStr.localeCompare(bStr)
            }
          }
        })
        processingSteps.push(`Sorted by ${parameters.sortBy} (${parameters.sortOrder || 'asc'})`)
      }

      // Build data mapping based on chart type
      let dataMapping: any = {}
      
      switch (chartType) {
        case 'bar':
          dataMapping = {
            indexBy: parameters.indexBy || headers.find(h => typeof data[0]?.[h] === 'string') || headers[0],
            valueColumns: parameters.valueColumns || headers.filter(h => typeof data[0]?.[h] === 'number').slice(0, 3)
          }
          break
        case 'line':
          dataMapping = {
            xColumn: parameters.xColumn || headers[0],
            yColumns: parameters.yColumns || headers.filter(h => typeof data[0]?.[h] === 'number').slice(0, 3)
          }
          break
        case 'pie':
          dataMapping = {
            idColumn: parameters.idColumn || headers.find(h => typeof data[0]?.[h] === 'string') || headers[0],
            valueColumn: parameters.valueColumn || headers.find(h => typeof data[0]?.[h] === 'number') || headers[1]
          }
          break
        case 'scatter':
          dataMapping = {
            xColumn: parameters.xColumn || headers.find(h => typeof data[0]?.[h] === 'number') || headers[0],
            yColumn: parameters.yColumn || headers.filter(h => typeof data[0]?.[h] === 'number')[1] || headers[1],
            seriesColumn: parameters.seriesColumn || headers.find(h => typeof data[0]?.[h] === 'string')
          }
          break
        default:
          dataMapping = {
            indexBy: parameters.indexBy || headers[0],
            valueColumns: parameters.valueColumns || headers.slice(1, 4),
            xColumn: parameters.xColumn || headers[0],
            yColumn: parameters.yColumn || headers[1],
            idColumn: parameters.idColumn || headers[0],
            valueColumn: parameters.valueColumn || headers[1]
          }
      }

      // Create the chart configuration
      const chartConfig = {
        chartType,
        title,
        description,
        margin: { top: 50, right: 110, bottom: 50, left: 60 },
        colors: { scheme: 'nivo' },
        dataMapping,
      }

      // Process the data using the UnifiedChartDataProcessor
      let chartFormattedData: any[]
      try {
        // Convert processed data back to CSV format for the processor
        const processedCsvHeaders = headers.join(',')
        const processedCsvRows = processedData.map(row => 
          headers.map(h => {
            const value = row[h]
            // Handle values that might contain commas
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`
            }
            return value
          }).join(',')
        )
        const processedCsvData = [processedCsvHeaders, ...processedCsvRows].join('\n')
        
        chartFormattedData = processChartData(chartType as any, processedCsvData, chartConfig as any)
      } catch (error) {
        console.error('Error processing chart data:', error)
        chartFormattedData = processedData // Fallback to raw data
      }

      // Create the chart object
      const newChart = {
        id: chartId,
        title,
        description,
        chartType,
        config: chartConfig,
        data: chartFormattedData, // Use properly formatted chart data
        commentary: {
          visualization: `This ${chartType} chart visualizes ${title.toLowerCase()}.`,
          importance: parameters.insights || `This visualization helps understand patterns and trends in the data.`,
          insights: parameters.insights || null,
          methodology: parameters.methodology || `Data sourced from ${sourceTab} tab${processingSteps.length > 1 ? `, processed through: ${processingSteps.slice(1).join(', ')}` : ''}.`,
        },
        processingSteps,
        metadata: {
          originalSource: `${sourceTab} tab`,
          sourceType: 'tab',
          sourceTab: sourceTab,
          processedAt: new Date().toISOString(),
          dataShape: [processedData.length, headers.length],
          processingSteps,
        }
      }

      // Add the chart to the dashboard
      setDashboardTabs((prev) => 
        prev.map((tab) => 
          tab.id === "dashboard-1" 
            ? { ...tab, charts: [...tab.charts, newChart], csvData: sourceTabData.csvData }
            : tab
        )
      )

    } catch (error) {
      console.error("Error creating chart from tab:", error)
    }
  }, [csvTabs, setDashboardTabs])

  // Handle data stream events for CSV tab management and chart creation
  React.useEffect(() => {
    const handleDataStreamEvent = (event: any) => {
      const eventData = event.data || event.detail
      
      if (eventData?.type === "csv-tab-create") {
        const { title, csvData: newCsvData, sourceTabId } = eventData
        addCsvTab(title, newCsvData, sourceTabId)
      } else if (eventData?.type === "csv-tab-update") {
        const { tabId, csvData: newCsvData, title } = eventData
        updateCsvTab(tabId, newCsvData, title)
      } else if (eventData?.type === "create-chart-from-tab") {
        const chartConfig = eventData.content
        createChartFromTab(chartConfig)
      } else if (eventData?.type === "dashboard-chart") {
        const { chart, csvData: chartCsvData, action } = eventData.content
        
        if (action === 'add' && chart) {
          setDashboardTabs((prev) => 
            prev.map((tab) => 
              tab.id === "dashboard-1" 
                ? { ...tab, charts: [...tab.charts, chart], csvData: chartCsvData || csvData }
                : tab
            )
          )
          
          if (chartCsvData && chartCsvData.includes(',') && chartCsvData.includes('\n')) {
            const chartDataTitle = `Data for ${chart.title}`;
            addCsvTab(chartDataTitle, chartCsvData);
          }
        }
      }
    }

    window.addEventListener("dashboardCsvTabEvent", handleDataStreamEvent)

    return () => {
      window.removeEventListener("dashboardCsvTabEvent", handleDataStreamEvent)
    }
  }, [addCsvTab, updateCsvTab, createChartFromTab])

  // Close CSV tab
  const closeCsvTab = useCallback(
    (tabId: string) => {
      setCsvTabs((prev) => {
        const newTabs = prev.filter((tab) => tab.id !== tabId)
        if (activeTab === tabId && newTabs.length > 0) {
          setActiveTab(newTabs[0].id)
        } else if (activeTab === tabId && newTabs.length === 0) {
          setActiveTab("dashboard-1")
        }
        return newTabs
      })
    },
    [activeTab],
  )

  const getCurrentCsvTab = () => {
    return csvTabs.find((tab) => tab.id === activeTab)
  }

  const getCurrentDashboardTab = () => {
    return dashboardTabs.find((tab) => tab.id === activeTab)
  }

  const getCurrentWorkflowTab = () => {
    return workflowTabs.find((tab) => tab.id === activeTab)
  }

  const isActiveTabCsv = activeTab.startsWith("csv-")
  const isActiveTabDashboard = activeTab.startsWith("dashboard-")
  const isActiveTabWorkflow = activeTab.startsWith("workflow-")

  // Debug function to inspect current state
  React.useEffect(() => {
    ;(window as any).debugDashboardState = () => {
      // Debug dashboard state
    }
  }, [activeTab, csvTabs, dashboardTabs])

  // Update dashboard tabs information for agent visibility
  React.useEffect(() => {
    const allTabs: DashboardTabInfo[] = [
      ...dashboardTabs.map(tab => ({
        title: tab.title,
        type: 'dashboard' as const,
        description: `Dashboard with ${tab.charts.length} charts`
      })),
      ...csvTabs.map(tab => ({
        title: tab.title,
        type: 'csv' as const,
        description: tab.isMain ? 'Original CSV data' : 'Processed CSV data'
      }))
    ];
    
    updateDashboardTabs(allTabs);
  }, [csvTabs, dashboardTabs]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          data-testid="dashboard"
          className="flex flex-row h-dvh w-dvw fixed top-0 left-0 z-50 bg-transparent"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { delay: 0.4 } }}
        >
          {/* Chat area background */}
          {!isMobile && (
            <motion.div
              className="fixed bg-background h-dvh"
              initial={{
                width: isSidebarOpen ? windowWidth - 256 : windowWidth,
                right: 0,
              }}
              animate={{ width: windowWidth, right: 0 }}
              exit={{
                width: isSidebarOpen ? windowWidth - 256 : windowWidth,
                right: 0,
              }}
            />
          )}

          {/* Dashboard panel */}
          <motion.div
            className="fixed dark:bg-muted bg-background h-dvh flex flex-col overflow-hidden md:border-l dark:border-zinc-700 border-zinc-200"
            initial={
              isMobile
                ? {
                    opacity: 1,
                    x: boundingBox.left,
                    y: boundingBox.top,
                    height: boundingBox.height,
                    width: boundingBox.width,
                    borderRadius: 50,
                  }
                : {
                    opacity: 1,
                    x: boundingBox.left,
                    y: boundingBox.top,
                    height: boundingBox.height,
                    width: boundingBox.width,
                    borderRadius: 50,
                  }
            }
            animate={
              isMobile
                ? {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    height: windowHeight,
                    width: windowWidth ? windowWidth : "calc(100vw)",
                    borderRadius: 0,
                    transition: {
                      delay: 0,
                      type: "spring",
                      stiffness: 200,
                      damping: 30,
                      duration: 5000,
                    },
                  }
                : {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    height: windowHeight,
                    width: windowWidth ? windowWidth : "calc(100vw)",
                    borderRadius: 0,
                    transition: {
                      delay: 0,
                      type: "spring",
                      stiffness: 200,
                      damping: 30,
                      duration: 5000,
                    },
                  }
            }
            exit={{
              opacity: 0,
              scale: 0.5,
              transition: {
                delay: 0.1,
                type: "spring",
                stiffness: 600,
                damping: 30,
              },
            }}
          >
            {/* Header with close button */}
            <div className="p-2 flex flex-row justify-between items-start border-b">
              <div className="flex flex-row gap-4 items-start">
                <Button
                  data-testid="dashboard-close-button"
                  variant="outline"
                  className="h-fit p-2 dark:hover:bg-zinc-700"
                  onClick={onClose}
                >
                  <CrossIcon size={18} />
                </Button>

                <div className="flex flex-col">
                  <div className="font-medium">Data Analysis Dashboard</div>
                  <div className="text-sm text-muted-foreground">
                    {isActiveTabCsv ? "CSV Data Table" : "Charts and Visualizations"}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid-cols-none flex overflow-x-auto border-b bg-background rounded-none h-12">
                {/* Dashboard Tabs */}
                {dashboardTabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 whitespace-nowrap">
                    <ChartBarIcon size={16} />
                    {tab.title}
                  </TabsTrigger>
                ))}

                { /* Workflow Tabs */}
                {workflowTabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 whitespace-nowrap">
                    <MenuIcon size={16} />
                    {tab.title}
                  </TabsTrigger>
                ))}
                {/* CSV Tabs */}
                {csvTabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 whitespace-nowrap group">
                    <TableIcon size={16} />
                    {tab.title}
                    {!tab.isMain && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 ml-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          closeCsvTab(tab.id)
                        }}
                      >
                        <CrossIcon size={12} />
                      </Button>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Contents - Fixed positioning */}
              <div className="flex-1 relative overflow-hidden">
                {/* Dashboard Tab Content */}
                {dashboardTabs.map((tab) => (
                  <TabsContent
                    key={tab.id}
                    value={tab.id}
                    className="absolute inset-0 m-0 data-[state=active]:flex data-[state=active]:flex-col overflow-auto"
                  >
                    <DataDashboard csvData={tab.csvData || csvData} initialCharts={tab.charts} />
                  </TabsContent>
                ))}
                {/* Workflow Tab Content */}
                {workflowTabs.map((tab) => (
                  <TabsContent
                    key={tab.id}
                    value={tab.id}
                    className="absolute inset-0 m-0 data-[state=active]:flex data-[state=active]:flex-col overflow-auto"
                  >
                    <WorkflowEditor
                      key={`workflow-editor-${tab.id}`}
                    ></WorkflowEditor>
                  </TabsContent>
                ))}
                {/* CSV Tab Content */}
                {csvTabs.map((tab) => (
                  <TabsContent
                    key={`csv-tab-${tab.id}`}
                    value={tab.id}
                    className="absolute inset-0 m-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden"
                  >
                    {activeTab === tab.id && (
                      <CsvDataTable
                        key={`csv-data-table-${tab.id}-${tab.csvData.length}`}
                        csvData={tab.csvData}
                        tabId={tab.id}
                        tabTitle={tab.title}
                        isMainTab={tab.isMain}
                        onUpdateTab={updateCsvTab}
                        onCreateNewTab={addCsvTab}
                      />
                    )}
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Dashboard
