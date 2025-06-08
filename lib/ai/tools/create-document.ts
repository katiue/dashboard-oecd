import { generateUUID } from '@/lib/utils';
import { tool, type DataStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
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
    description: `Create a document for writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.`,

    parameters: z.object({
      title: z.string().describe('Title for the document'),
      kind: z.enum(artifactKinds).describe('Type of document to create'),
    }),
    
    execute: async ({ title, kind }) => {
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

      // Use title as-is for all document types
      const enhancedTitle = title;

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

      // Return standard response for all document types
      return {
        id,
        title: enhancedTitle,
        kind,
        content: 'A document was created and is now visible to the user.',
      };
    },
  });
