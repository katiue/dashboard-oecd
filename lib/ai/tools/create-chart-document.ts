import { tool } from 'ai';
import { generateUUID } from '@/lib/utils';
import { z } from 'zod';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';

export function createChartDocument({ session, dataStream }: any) {
  return tool({
    description: 'Create a chart document. Provide a descriptive title that includes what kind of charts and data you want to visualize.',
    parameters: z.object({
      title: z.string().describe('The title/description of the chart document to create. Should describe the data and visualization goals.'),
    }),
    execute: async ({ title }) => {
      try {
        const id = generateUUID();

        dataStream.writeData({
          type: 'kind',
          content: 'chart',
        });

        dataStream.writeData({
          type: 'id',
          content: id,
        });

        dataStream.writeData({
          type: 'title',
          content: title,
        });

        dataStream.writeData({
          type: 'clear',
          content: '',
        });

        // Find the chart document handler
        const documentHandler = documentHandlersByArtifactKind.find(
          (handler) => handler.kind === 'chart',
        );

        if (!documentHandler) {
          throw new Error('Chart document handler not found');
        }

        // Create the chart document
        await documentHandler.onCreateDocument({
          id,
          title,
          dataStream,
          session,
        });

        dataStream.writeData({ type: 'finish', content: '' });

        return {
          id,
          title,
          kind: 'chart',
          message: `Successfully created chart document: ${title}`,
        };

      } catch (error) {
        return {
          error: `Failed to create chart document: ${error instanceof Error ? error.message : 'Unknown error'}`,
          documentId: null,
        };
      }
    },
  });
} 