import { myProvider } from '@/lib/ai/providers';
import { chartPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod';

export const chartDocumentHandler = createDocumentHandler<'chart'>({
  kind: 'chart',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: chartPrompt,
      prompt: title,
      schema: z.object({
        chartData: z.object({
          csvData: z.string().describe('CSV formatted data'),
          charts: z
            .array(
              z.object({
                chartType: z
                  .enum(['bar', 'line', 'pie', 'heatmap', 'radar', 'scatter'])
                  .describe('Type of chart'),
                title: z.string().describe('Title of the chart'),
                description: z
                  .string()
                  .describe('Description of what the chart represents'),
                data: z
                  .any()
                  .optional()
                  .describe('Processed data for the chart'),
              }),
            )
            .max(6)
            .describe('Chart configurations (maximum of 6)'),
        }),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { chartData } = object;

        if (chartData) {
          const content = JSON.stringify(chartData, null, 2);

          dataStream.writeData({
            type: 'chart-delta',
            content,
          });

          draftContent = content;
        }
      }
    }

    dataStream.writeData({
      type: 'chart-delta',
      content: draftContent,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'chart'),
      prompt: description,
      schema: z.object({
        chartData: z.object({
          csvData: z.string().describe('CSV formatted data'),
          charts: z
            .array(
              z.object({
                chartType: z
                  .enum(['bar', 'line', 'pie', 'heatmap', 'radar', 'scatter'])
                  .describe('Type of chart'),
                title: z.string().describe('Title of the chart'),
                description: z
                  .string()
                  .describe('Description of what the chart represents'),
                data: z
                  .any()
                  .optional()
                  .describe('Processed data for the chart'),
              }),
            )
            .max(6)
            .describe('Chart configurations (maximum of 6)'),
        }),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { chartData } = object;

        if (chartData) {
          const content = JSON.stringify(chartData, null, 2);

          dataStream.writeData({
            type: 'chart-delta',
            content,
          });

          draftContent = content;
        }
      }
    }

    // send final state back after updates
    dataStream.writeData({
      type: 'chart-delta',
      content: draftContent,
    });

    return draftContent;
  },
});
