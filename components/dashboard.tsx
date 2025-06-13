"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useWindowSize } from "usehooks-ts"
import { CrossIcon, ChartBarIcon, MenuIcon } from "./icons"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { DataDashboard } from "./data-dashboard"
import { WorkflowEditor } from "./workflow-editor"
import { useSidebar } from "./ui/sidebar"

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

  // Simple state for 3 fixed tabs
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [charts, setCharts] = useState<any[]>([])

  // Update dashboard charts when dashboardData changes
  React.useEffect(() => {
    if (dashboardData?.charts && dashboardData.charts.length > 0) {
      setCharts(dashboardData.charts)
    }
  }, [dashboardData])

  // Handle data stream events for chart creation
  React.useEffect(() => {
    const handleDataStreamEvent = (event: any) => {
      const eventData = event.data || event.detail
      
      if (eventData?.type === "dashboard-chart") {
        const { chart, action } = eventData.content
        
        if (action === 'add' && chart) {
          setCharts((prev) => [...prev, chart])
        }
      }
    }

    window.addEventListener("dashboardCsvTabEvent", handleDataStreamEvent)

    return () => {
      window.removeEventListener("dashboardCsvTabEvent", handleDataStreamEvent)
    }
  }, [])

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
                    {activeTab === "workflow" ? "Data Processing Workflow" : 
                     "Charts and Visualizations"}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-3 border-b bg-background rounded-none h-12">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <ChartBarIcon size={16} />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="workflow" className="flex items-center gap-2">
                  <MenuIcon size={16} />
                  Workflow
                </TabsTrigger>
              </TabsList>

              {/* Tab Contents */}
              <div className="flex-1 relative overflow-hidden">
                <TabsContent
                  value="dashboard"
                  className="absolute inset-0 m-0 data-[state=active]:flex data-[state=active]:flex-col overflow-auto"
                >
                  <DataDashboard csvData={csvData} initialCharts={charts} />
                </TabsContent>

                <TabsContent
                  value="workflow"
                  className="absolute inset-0 m-0 data-[state=active]:flex data-[state=active]:flex-col overflow-auto"
                >
                  <WorkflowEditor />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Dashboard
