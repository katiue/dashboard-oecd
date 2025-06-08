'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DashboardState } from '@/components/dashboard';
import { processChartData } from '@/lib/chart/UnifiedChartDataProcessor';

interface DashboardContextType {
  dashboard: DashboardState;
  setDashboard: React.Dispatch<React.SetStateAction<DashboardState>>;
  addChartToDashboard: (chart: any, csvData: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [dashboard, setDashboard] = useState<DashboardState>({
    isVisible: false,
    csvData: '',
    dashboardData: undefined,
    boundingBox: { top: 0, left: 0, width: 0, height: 0 },
  });

  const addChartToDashboard = useCallback((chart: any, csvData: string) => {
    try {
      // Fix chart structure to match DataDashboard expectations
      const normalizedChart = {
        id: chart.id || `chart-${Date.now()}`,
        title: chart.title || 'Untitled Chart',
        description: chart.description || '',
        chartType: chart.type || chart.chartType, // Handle both type and chartType
        config: chart.config,
        commentary: {
          visualization: chart.commentary?.insights || chart.commentary?.visualization || 'Chart analysis',
          importance: chart.commentary?.importance || chart.commentary?.methodology || 'Important insights from data'
        }
      };

      // Process the chart data using the CSV data and config
      let processedData = [];
      if (csvData && chart.config) {
        try {
          processedData = processChartData(chart.chartType || chart.type, csvData, chart.config);
          
          // Additional validation and cleaning
          processedData = Array.isArray(processedData) ? processedData.map(item => {
            if (!item || typeof item !== 'object') {
              return null;
            }
            
            const cleanedItem: any = {};
            Object.keys(item).forEach(key => {
              const value = item[key];
              if (typeof value === 'number') {
                cleanedItem[key] = isFinite(value) ? value : 0;
              } else if (typeof value === 'string') {
                cleanedItem[key] = value.trim() || 'Unknown';
              } else {
                cleanedItem[key] = value;
              }
            });
            
            return cleanedItem;
          }).filter(Boolean) : [];
          
        } catch (error) {
          console.error('Error processing chart data:', error);
          processedData = [];
        }
      }

      // Add processed data to the chart
      const chartWithData = {
        ...normalizedChart,
        data: processedData
      };

      setDashboard(prev => {
        // Check if chart already exists to prevent duplicates
        const existingChartIndex = prev.dashboardData?.charts?.findIndex((c: any) => c.id === chartWithData.id) ?? -1;
        if (existingChartIndex >= 0) {
          return prev;
        }
        
        // Initialize dashboard data if not exists
        const currentDashboardData = prev.dashboardData || {
          csvData: csvData || prev.csvData,
          charts: [],
          metadata: {
            createdAt: new Date().toISOString(),
            csvHeaders: [],
            numericColumns: [],
            textColumns: [],
            dateColumns: [],
            totalDataPoints: 0,
            analysisType: 'interactive'
          }
        };

        // Add the new chart to the charts array
        const updatedCharts = [...(currentDashboardData.charts || []), chartWithData];
        
        return {
          ...prev,
          csvData: csvData || prev.csvData,
          dashboardData: {
            ...currentDashboardData,
            csvData: csvData || currentDashboardData.csvData,
            charts: updatedCharts
          }
        };
      });
    } catch (error) {
      console.error('Error adding chart to dashboard:', error);
    }
  }, []);

  return (
    <DashboardContext.Provider value={{ dashboard, setDashboard, addChartToDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
} 