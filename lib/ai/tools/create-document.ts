import { generateUUID } from '@/lib/utils';
import { DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import { Session } from 'next-auth';
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from '@/lib/artifacts/server';

interface CreateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      'Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind. For chart documents, you can optionally specify the chart type.',
    parameters: z.object({
      title: z.string(),
      kind: z.enum(artifactKinds),
      chartType: z.enum(['bar', 'line', 'pie', 'heatmap', 'radar', 'scatter', 'areaBump']).optional().describe('The type of chart to create (only applicable when kind is "chart")'),
    }),
    execute: async ({ title, kind, chartType }) => {
      const id = generateUUID();

      dataStream.writeData({
        type: 'kind',
        content: kind,
      });

      dataStream.writeData({
        type: 'id',
        content: id,
      });

      dataStream.writeData({
        type: 'title',
        content: title,
      });

      // If chart type is specified, include it in the title for better context
      const enhancedTitle = chartType && kind === 'chart' 
        ? `${title} (${chartType} chart)` 
        : title;

      dataStream.writeData({
        type: 'clear',
        content: '',
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind,
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      await documentHandler.onCreateDocument({
        id,
        title: enhancedTitle,
        dataStream,
        session,
      });

      dataStream.writeData({ type: 'finish', content: '' });

      return {
        id,
        title: enhancedTitle,
        kind,
        chartType: chartType || undefined,
        content: 'A document was created and is now visible to the user.',
      };
    },
  });
