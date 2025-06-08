'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWindowSize } from 'usehooks-ts';
import { CrossIcon } from './icons';
import { Button } from './ui/button';
import { DataDashboard } from './data-dashboard';
import { useSidebar } from './ui/sidebar';

export interface DashboardState {
  isVisible: boolean;
  csvData: string;
  dashboardData?: any; // Dashboard data from tool results
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

interface DashboardProps {
  isVisible: boolean;
  csvData: string;
  dashboardData?: any; // Dashboard data from createDashboard/updateDashboard tools
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  onClose: () => void;
}

function Dashboard({ isVisible, csvData, dashboardData, boundingBox, onClose }: DashboardProps) {
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const { state: sidebarState } = useSidebar();
  const isSidebarOpen = sidebarState === 'expanded';
  const isMobile = windowWidth ? windowWidth < 768 : false;

  // Determine what data to display
  const displayData = React.useMemo(() => {
    // If we have dashboard data from tools, use that
    if (dashboardData?.csvData) {
      return dashboardData.csvData;
    }
    
    // If csvData is a URL, show loading state (tools will handle fetching)
    if (csvData && (csvData.startsWith('http') || csvData.startsWith('blob:'))) {
      return null; // Show loading state
    }
    
    // If csvData is actual CSV content, use it
    if (csvData && csvData.includes(',') && csvData.includes('\n')) {
      return csvData;
    }
    
    // No data available
    return null;
  }, [csvData, dashboardData]);

  const charts = React.useMemo(() => {
    return dashboardData?.charts || [];
  }, [dashboardData]);

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
                    width: windowWidth ? windowWidth : 'calc(100vw)',
                    borderRadius: 0,
                    transition: {
                      delay: 0,
                      type: 'spring',
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
                    width: windowWidth
                      ? windowWidth
                      : 'calc(100vw)',
                    borderRadius: 0,
                    transition: {
                      delay: 0,
                      type: 'spring',
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
                type: 'spring',
                stiffness: 600,
                damping: 30,
              },
            }}
          >
            <div className="p-2 flex flex-row justify-between items-start">
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
                  <div className="font-medium">
                    {dashboardData?.title || 'Data Dashboard'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dashboardData?.description || 'Interactive charts and visualizations'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {displayData ? (
                <DataDashboard 
                  csvData={displayData}
                  initialCharts={charts}
                />
              ) : csvData && csvData.startsWith('http') ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
                    <div className="text-sm text-muted-foreground">
                      Creating dashboard from your data...
                    </div>
                  </div>
                </div>
              ) : charts && charts.length > 0 ? (
                <DataDashboard 
                  csvData=""
                  initialCharts={charts}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <div className="text-lg font-medium">No Data Available</div>
                    <div className="text-sm text-muted-foreground">
                      Upload a CSV file or use the createEnhancedDashboardChart tool to create visualizations
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Dashboard; 