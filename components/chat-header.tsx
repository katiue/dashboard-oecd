'use client';

import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import React, { useRef, useCallback , memo } from 'react';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import { ApiKeySelector } from './api-key-selector';
import Dashboard from './dashboard';
import type { Session } from 'next-auth';
import { BarChartIcon } from './chart-icons';
import { extractCsvFiles } from '@/lib/ai/csv-transform';
import { useDashboard } from '@/hooks/use-dashboard';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
  messages,
  append,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  messages: Array<any>;
  append?: (message: any) => void;
}) {
  const router = useRouter();
  const { open, toggleSidebar } = useSidebar();
  const dashboardButtonRef = useRef<HTMLButtonElement>(null);
  const { dashboard, setDashboard } = useDashboard();

  const { width: windowWidth } = useWindowSize();

  const openDashboard = useCallback(() => {
    const buttonElement = dashboardButtonRef.current;
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      
      // Extract CSV files from the conversation
      const csvFiles = extractCsvFiles(messages || [], [], { attachments: [] });
      
      // Always open the dashboard - let it handle the "no data" state internally
      let csvData = '';
      const dashboardData = dashboard.dashboardData; // Use existing dashboard data
      
      if (csvFiles.length > 0) {
        // Use the first CSV file found
        const primaryCsvFile = csvFiles[0];
        csvData = primaryCsvFile.url; // Pass URL instead of data
      }
      
      setDashboard({
        isVisible: true,
        csvData,
        dashboardData,
        boundingBox: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
      });
    }
  }, [messages, dashboard.dashboardData, setDashboard]);

  const closeDashboard = useCallback(() => {
    setDashboard(prev => ({ ...prev, isVisible: false }));
  }, [setDashboard]);

  return (
    <>
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}

      {!isReadonly && (
        <ModelSelector
          session={session}
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )}

      {!isReadonly && <ApiKeySelector className="order-1 md:order-4" />}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={dashboardButtonRef}
              variant="outline"
              size="sm"
              onClick={openDashboard}
              className="flex items-center gap-2 order-5"
              disabled={!append}
            >
              <BarChartIcon size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open Data Dashboard</TooltipContent>
        </Tooltip>
    </header>

      <Dashboard
        isVisible={dashboard.isVisible}
        csvData={dashboard.csvData}
        dashboardData={dashboard.dashboardData}
        boundingBox={dashboard.boundingBox}
        onClose={closeDashboard}
      />
    </>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
