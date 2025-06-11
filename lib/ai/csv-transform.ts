/**
 * CSV file transformation utilities for AI chat processing
 * Handles extraction of CSV files from conversation and message transformation
 */

export interface CsvFile {
  name: string;
  url: string;
  contentType: string;
}

// Track dashboard tabs for agent visibility
export interface DashboardTabInfo {
  title: string;
  type: 'csv' | 'dashboard';
  description?: string;
}

// Global state for dashboard tabs (this will be managed by the dashboard component)
let dashboardTabs: DashboardTabInfo[] = [];

/**
 * Update dashboard tabs information (called by dashboard component)
 */
export function updateDashboardTabs(tabs: DashboardTabInfo[]) {
  dashboardTabs = tabs;
}

/**
 * Get current dashboard tabs
 */
export function getDashboardTabs(): DashboardTabInfo[] {
  return dashboardTabs;
}

/**
 * Extract CSV files from the entire conversation history
 * Looks through all messages (both previous and current) to find CSV attachments
 */
export function extractCsvFiles(messages: any[], previousMessages: any[], currentMessage: any): CsvFile[] {
  const csvFiles: CsvFile[] = [];
  
  // Look at both current messages and previousMessages to find all CSV files ever uploaded
  const allMessages = [...previousMessages, currentMessage];
  
  allMessages.forEach((msg) => {
    // Handle both experimental_attachments and attachments properties
    const attachments = msg?.experimental_attachments || msg?.attachments || [];
    
    if (attachments && attachments.length > 0) {
      const csvAttachments = attachments.filter((att: any) => 
        att.contentType === 'text/csv' || att.contentType === 'application/vnd.ms-excel'
      );
      
      csvAttachments.forEach((csvAtt: any) => {
        // Check if we already have this file (by URL)
        const existingFile = csvFiles.find(f => f.url === csvAtt.url);
        if (!existingFile) {
          csvFiles.push({
            name: csvAtt.name,
            url: csvAtt.url,
            contentType: csvAtt.contentType
          });
        }
      });
    }
  });
  
  return csvFiles;
}

/**
 * Transform messages for the AI agent by:
 * 1. Adding CSV context to the current (last) message
 * 2. Removing CSV attachments but keeping other attachments
 */
export function transformMessagesForAgent(messages: any[], csvFiles: CsvFile[]): any[] {
  const transformedMessages = messages.map((msg, msgIndex) => {
    const transformedMsg = { ...msg };
    
    // Only add CSV context to the CURRENT (last) message to avoid confusion
    if (csvFiles.length > 0 && msgIndex === messages.length - 1) {
      const originalContent = msg.content || '';
      let csvContext = '\n\n🔗 **AVAILABLE CSV FILES** 🔗\n';
      csvContext += 'The following CSV files are available in this conversation:\n\n';
      csvFiles.forEach((file, index) => {
        csvContext += `📊 **${index + 1}. ${file.name}**\n`;
        csvContext += `   URL: ${file.url}\n\n`;
      });
      csvContext += '💡 **Instructions:** Use the loadCsvFromUrl, cleanDataAdvanced, detectAndResolveDuplicatesAdvanced, inferAndCastTypes, filterDataAdvanced, aggregateDataAdvanced, sumColumnAdvanced, createInlineChart or createDocument with chart artifact tools with the URLs above.\n';
      csvContext += '📝 **Important:** Always use the exact URLs provided when calling CSV tools.\n\n';
      csvContext += '---\n\n';
      
      transformedMsg.content = csvContext + originalContent;
    }
    
    // Remove CSV attachments but keep other attachments for all messages
    if (msg.experimental_attachments) {
      const nonCsvAttachments = msg.experimental_attachments.filter((att: any) => 
        att.contentType !== 'text/csv' && att.contentType !== 'application/vnd.ms-excel'
      );
      
      transformedMsg.experimental_attachments = nonCsvAttachments.length > 0 ? nonCsvAttachments : undefined;
    }
    
    return transformedMsg;
  });
  
  return transformedMessages;
}

/**
 * Generate additional system prompt instructions when CSV files are present
 */
export function generateCsvSystemPrompt(csvFiles: CsvFile[]): string {
  if (csvFiles.length === 0) {
    return '';
  }

  let csvSystemPrompt = `\n\n** IMPORTANT CSV FILES CONTEXT **\n
  There are ${csvFiles.length} CSV file(s) available in this conversation:\n`;
  csvFiles.forEach((file, index) => {
    csvSystemPrompt += `${index + 1}. "${file.name}" at URL: ${file.url}\n`;
  });

  // Add dashboard tabs information if available
  if (dashboardTabs.length > 0) {
    csvSystemPrompt += `\n** AVAILABLE DASHBOARD TABS **\n`;
    csvSystemPrompt += `Current tabs in the dashboard (use these exact names with createChartFromTabData):\n`;
    dashboardTabs.forEach((tab, index) => {
      const icon = tab.type === 'csv' ? '📊' : '📈';
      csvSystemPrompt += `${icon} ${index + 1}. "${tab.title}" (${tab.type})\n`;
    });
    csvSystemPrompt += `\n`;
  }

  csvSystemPrompt += `\nWhen the user asks about data analysis, charts, or working with data:\n
  - ALWAYS start by using loadCsvFromUrl tool with BOTH the URL and the fileName parameter\n
  - When calling loadCsvFromUrl, use: { url: "URL_HERE", fileName: "FILE_NAME_HERE" }\n
  - This creates properly named CSV tabs using the actual file names\n
  - Use cleanData tool to normalize formatting and fix encoding issues\n
  - IMMEDIATELY use detectAndResolveDuplicates tool if the data contains identifiers (names, IDs, etc.)\n
   - This tool intelligently handles duplicates: either aggregates values OR creates unique names (Perch_1, Perch_2)\n
   - Use the processed data from detectAndResolveDuplicates for all chart creation\n
   - Use sumColumn tool when you need column totals with statistical insights\n
   - Use filterData and aggregateData for sophisticated data processing\n
   - Use createChartFromTabData to create charts from existing dashboard tabs (see available tabs above)\n
   - Use createInlineChart tools for quick visualizations\n
  - NEVER ask the user to upload files - the files are already available\n
  - ALWAYS use the exact URLs provided above when calling CSV tools\n
  - ALWAYS pass the fileName parameter to ensure proper tab naming\n
  - When using createChartFromTabData, use the exact tab names listed above\n
  \n** CRITICAL DUPLICATE HANDLING **\n
  If you see duplicate warnings like "67% of Car_Name values are duplicates":\n
  1. Use detectAndResolveDuplicates tool with the identifier column\n
  2. Tool will either aggregate values OR create unique names (Perch_1, Perch_2) for better visualization\n
  3. Use the processedData result for all subsequent chart creation\n
  4. This prevents chart errors and provides clear, meaningful insights\n`;

  return csvSystemPrompt;
}
