/**
 * CSV file transformation utilities for AI chat processing
 * Handles extraction of CSV files from conversation and message transformation
 */

export interface CsvFile {
  name: string;
  url: string;
  contentType: string;
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
      csvContext += '💡 **Instructions:** Use the readCsvFile, filterCsvData, createInlineChart or createDocument with chart artifact tools with the URLs above.\n';
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
  csvSystemPrompt += `\nWhen the user asks about data analysis, charts, or working with data:\n
  - ALWAYS start by using readCsvFile tool to understand the data structure\n
  - IMMEDIATELY use detectAndResolveDuplicates tool if the data contains identifiers (names, IDs, etc.)\n
   - Use the aggregated data from detectAndResolveDuplicates for all chart creation\n
   - Use sumEntireColumn tool when you need column totals\n
   - Use cleanDataForDashboard, resolveDuplicatesForDashboard, or processDataForDashboard to UPDATE the dashboard data tab\n
   - Use createDashboardChart or createInlineChart tools for visualizations\n
   - Use filterCsvData tool for data filtering\n
  - NEVER ask the user to upload files - the files are already available\n
  - NEVER REVEAL THE URLS TO THE USER - THEY ARE FOR INTERNAL USE ONLY\n
  - ALWAYS use the exact URLs provided above when calling CSV tools\n
  \n** CRITICAL DUPLICATE HANDLING **\n
  If you see duplicate warnings like "67% of Car_Name values are duplicates":\n
  1. Use detectAndResolveDuplicates tool with the identifier column\n
  2. Use the aggregatedData result for all subsequent chart creation\n
  3. This prevents chart errors and provides meaningful insights\n`;

  return csvSystemPrompt;
}
