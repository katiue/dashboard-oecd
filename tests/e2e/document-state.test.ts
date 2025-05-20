import { expect, test } from '../fixtures';
import { ChatPage } from '../pages/chat';
import { ArtifactPage } from '../pages/artifact';

test.describe('Document State Management', () => {
  let chatPage: ChatPage;
  let artifactPage: ArtifactPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    artifactPage = new ArtifactPage(page);

    await chatPage.createNewChat();
  });

  test('Chart preview state should not persist between documents', async ({
    page,
  }) => {
    // Create a first chart
    await chatPage.sendUserMessage(
      'Create a chart showing sales data by month',
    );
    await artifactPage.isGenerationComplete();
    expect(artifactPage.artifact).toBeVisible();
    await page.waitForTimeout(500); // Let charts render

    // Close the artifact
    await artifactPage.closeArtifact();

    // Create a second chart and verify it doesn't have first chart's data
    await chatPage.sendUserMessage(
      'Create a pie chart showing browser market share',
    );
    await artifactPage.isGenerationComplete();
    expect(artifactPage.artifact).toBeVisible();
    // State persistence would show remnants of the first chart
    await page.waitForTimeout(500);

    // Validate that the content has changed
    const chartContent = await page.evaluate(() => {
      const chartElement = document.querySelector(
        '[data-testid="artifact"] .chart-container',
      );
      return chartElement?.textContent || '';
    });

    // The second chart shouldn't have "sales" data
    expect(chartContent).not.toContain('sales');
  });

  test('Code editor state should reset between documents', async ({ page }) => {
    // Create a first code document
    await chatPage.sendUserMessage(
      'Write a JavaScript function to calculate factorial',
    );
    await artifactPage.isGenerationComplete();
    expect(artifactPage.artifact).toBeVisible();

    // Close the artifact
    await artifactPage.closeArtifact();

    // Create a second code document
    await chatPage.sendUserMessage('Write a Python function to sort a list');
    await artifactPage.isGenerationComplete();
    expect(artifactPage.artifact).toBeVisible();

    // Check that the content contains Python and not JavaScript
    const codeContent = await page.evaluate(() => {
      const codeElement = document.querySelector(
        '[data-testid="artifact"] .cm-content',
      );
      return codeElement?.textContent || '';
    });

    expect(codeContent).toContain('def');
    expect(codeContent).not.toContain('factorial');
  });
});
