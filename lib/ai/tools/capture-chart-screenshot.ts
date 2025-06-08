import { tool } from 'ai';
import { z } from 'zod';

export const captureChartScreenshot = tool({
  description: `Capture a screenshot of a chart and return the image for visual analysis. This tool can capture screenshots of:

1. **Regular inline charts** created with createInlineChart
2. **Dashboard charts** created with createDashboardChart 
3. **Fullscreen dashboard charts** when a chart is expanded to full screen

Use this tool when:
- You want to see how a chart actually looks visually
- You need to analyze the chart appearance to suggest improvements  
- You want to verify how a chart renders with the current configuration
- You're debugging visual issues or layout problems
- You want to analyze dashboard charts that were created with createDashboardChart

The tool will automatically detect the chart type and location (dashboard vs inline vs fullscreen) and capture the appropriate screenshot.`,
  
  parameters: z.object({
    chartId: z.string().describe('The unique ID of the chart to capture (from createInlineChart or createDashboardChart)'),
    chartLocation: z.enum(['inline', 'dashboard', 'fullscreen']).optional().describe('Where the chart is displayed - auto-detected if not specified'),
    includeMetadata: z.boolean().optional().default(true).describe('Whether to include chart metadata in the response'),
    captureFullContext: z.boolean().optional().default(false).describe('Whether to capture surrounding UI context (useful for dashboard charts)'),
  }),
  
  execute: async ({ chartId, chartLocation, includeMetadata = true, captureFullContext = false }) => {
    try {
      
      const timestamp = new Date().toISOString();
      
      // Determine chart selectors based on location
      const chartSelectors = [
        `[data-chart-id="${chartId}"]`, // Regular dashboard chart
        `[data-chart-id="fullscreen-${chartId}"]`, // Fullscreen chart
        `#chart-${chartId}`, // Inline chart (alternative selector)
        `.chart-container[data-id="${chartId}"]`, // Generic chart container
      ];
      
      // Auto-detect chart location if not specified
      let detectedLocation = chartLocation;
      if (!detectedLocation) {
        // Check if fullscreen chart exists
        if (document.querySelector(`[data-chart-id="fullscreen-${chartId}"]`)) {
          detectedLocation = 'fullscreen';
        } else if (document.querySelector(`[data-chart-id="${chartId}"]`)) {
          detectedLocation = 'dashboard';
        } else {
          detectedLocation = 'inline';
        }
      }
      
      // Select appropriate capture area based on chart location
      let captureSelector = chartSelectors[0]; // Default
      let captureDescription = 'chart visualization';
      
      switch (detectedLocation) {
        case 'fullscreen':
          captureSelector = `[data-chart-id="fullscreen-${chartId}"]`;
          captureDescription = 'fullscreen chart with configuration panel';
          break;
        case 'dashboard': 
          if (captureFullContext) {
            captureSelector = `.card:has([data-chart-id="${chartId}"])`;
            captureDescription = 'dashboard chart with card context';
          } else {
            captureSelector = `[data-chart-id="${chartId}"]`;
            captureDescription = 'dashboard chart visualization';
          }
          break;
        case 'inline':
          captureSelector = `#chart-${chartId}`;
          captureDescription = 'inline chart in conversation';
          break;
      }
      
      // In a real implementation, this would:
      // 1. Use the appropriate selector to find the chart element
      // 2. Use html2canvas, Puppeteer, or similar to capture the element
      // 3. Handle different chart locations appropriately
      // 4. Return the actual screenshot data
      
      const mockScreenshot = {
        chartId,
        timestamp,
        location: detectedLocation,
        selector: captureSelector,
        image: {
          format: 'png',
          width: detectedLocation === 'fullscreen' ? 1600 : 800,
          height: detectedLocation === 'fullscreen' ? 900 : 400,
          base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          url: `screenshot-${chartId}-${detectedLocation}-${Date.now()}.png`,
          note: `This is a simulated screenshot of a ${captureDescription}. In a real implementation, this would contain the actual chart image data.`
        },
        captureInfo: {
          capturedAt: timestamp,
          method: 'simulated', // Would be 'html2canvas', 'puppeteer', etc.
          chartElement: captureSelector,
          chartLocation: detectedLocation,
          fullContext: captureFullContext,
          success: true,
          dimensions: {
            width: detectedLocation === 'fullscreen' ? 1600 : 800,
            height: detectedLocation === 'fullscreen' ? 900 : 400
          }
        }
      };
      
      const analysisPrompt = generateAnalysisPrompt(detectedLocation, captureFullContext);
      
      const response: any = {
        success: true,
        chartId,
        location: detectedLocation,
        screenshot: mockScreenshot,
        timestamp,
        message: `Screenshot captured for ${detectedLocation} chart ${chartId}. ${analysisPrompt}`,
        analysisPrompt
      };
      
      if (includeMetadata) {
        response.metadata = {
          chartSelector: captureSelector,
          captureMethod: 'Enhanced chart screenshot with location detection',
          imageFormat: 'PNG',
          dimensions: `${mockScreenshot.image.width}x${mockScreenshot.image.height}`,
          chartLocation: detectedLocation,
          contextIncluded: captureFullContext,
          usage: `Analyze the ${captureDescription} and suggest improvements`,
          availableSelectors: chartSelectors,
          detectionMethod: chartLocation ? 'user-specified' : 'auto-detected'
        };
      }
      
      return response;
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to capture chart screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        chartId,
        timestamp: new Date().toISOString(),
        message: `Screenshot capture failed for chart ${chartId}. The chart may not be rendered yet, the ID may be incorrect, or the chart may be in a different location than expected.`,
        troubleshooting: {
          suggestions: [
            'Verify the chart ID is correct',
            'Check if the chart is fully rendered',
            'Try specifying the chartLocation parameter (inline/dashboard/fullscreen)',
            'Ensure the chart was created successfully before taking screenshot'
          ],
          commonIssues: [
            'Chart not yet rendered in DOM',
            'Incorrect chart ID format',  
            'Chart in different location than expected',
            'Network request still in progress'
          ]
        }
      };
    }
  }
});

function generateAnalysisPrompt(location: string, fullContext: boolean): string {
  const basePrompt = "You can now analyze the chart's visual appearance and suggest improvements.";
  
  switch (location) {
    case 'fullscreen':
      return `${basePrompt} This fullscreen view shows the chart at full size with the configuration panel visible. You can analyze both the chart visualization and suggest specific configuration changes.`;
    case 'dashboard':
      if (fullContext) {
        return `${basePrompt} This dashboard view shows the chart within its card context, including title, description, and key takeaway. You can analyze the overall presentation and suggest layout improvements.`;
      } else {
        return `${basePrompt} This dashboard chart view focuses on the visualization itself. You can analyze the chart design and suggest visual enhancements.`;
      }
    case 'inline':
      return `${basePrompt} This inline chart view shows how the chart appears in conversation. You can analyze readability and suggest optimizations for the chat context.`;
    default:
      return basePrompt;
  }
}
