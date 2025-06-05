import { generateUUID } from '@/lib/utils';
import { tool, type DataStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from '@/lib/artifacts/server';
import { DATA_MAPPING_EXAMPLES } from '@/lib/chart/ChartSchemas';

interface CreateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description: `Create a document for writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.

For chart documents, you should specify how to map CSV columns to chart data. Use these data mapping patterns:

${Object.entries(DATA_MAPPING_EXAMPLES).map(([type, example]) => 
  `${type.toUpperCase()}: ${example.description}\nExample mapping: ${JSON.stringify(example.example, null, 2)}`
).join('\n\n')}

The chart creation process will use the configureChart tool internally to set up proper data mappings.`,

    parameters: z.object({
      title: z.string().describe('Title for the document'),
      kind: z.enum(artifactKinds).describe('Type of document to create'),
      chartType: z.enum(['bar', 'line', 'pie', 'heatmap', 'radar', 'scatter', 'areaBump']).optional().describe('The type of chart to create (only applicable when kind is "chart")'),
      
      // Chart-specific parameters for better chart generation
      chartDescription: z.string().optional().describe('Description of what the chart should visualize (for chart documents)'),
      suggestedDataMapping: z.object({
        indexBy: z.string().optional(),
        valueColumns: z.array(z.string()).optional(),
        xColumn: z.string().optional(),
        yColumn: z.string().optional(),
        yColumns: z.array(z.string()).optional(),
        idColumn: z.string().optional(),
        valueColumn: z.string().optional(),
        seriesColumn: z.string().optional(),
        seriesColumns: z.array(z.string()).optional(),
      }).optional().describe('Suggested column mappings for the chart (for chart documents)'),
    }),
    
    execute: async ({ title, kind, chartType, chartDescription, suggestedDataMapping }) => {
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

      // Enhanced title with chart context and data mapping guidance
      let enhancedTitle = title;
      if (chartType && kind === 'chart') {
        enhancedTitle = `${title} (${chartType} chart)`;
        
        if (chartDescription) {
          enhancedTitle += ` - ${chartDescription}`;
        }
        
        // Add data mapping context to the title for the chart generation system
        if (suggestedDataMapping) {
          const mappingHints = [];
          if (suggestedDataMapping.indexBy) mappingHints.push(`categories: ${suggestedDataMapping.indexBy}`);
          if (suggestedDataMapping.valueColumns) mappingHints.push(`values: ${suggestedDataMapping.valueColumns.join(', ')}`);
          if (suggestedDataMapping.xColumn) mappingHints.push(`x-axis: ${suggestedDataMapping.xColumn}`);
          if (suggestedDataMapping.yColumns) mappingHints.push(`y-lines: ${suggestedDataMapping.yColumns.join(', ')}`);
          if (suggestedDataMapping.idColumn) mappingHints.push(`labels: ${suggestedDataMapping.idColumn}`);
          if (suggestedDataMapping.valueColumn) mappingHints.push(`values: ${suggestedDataMapping.valueColumn}`);
          
          if (mappingHints.length > 0) {
            enhancedTitle += ` [Data mapping: ${mappingHints.join(', ')}]`;
          }
        }
      }

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

      // Prepare response with chart-specific guidance
      const response: any = {
        id,
        title: enhancedTitle,
        kind,
        content: 'A document was created and is now visible to the user.',
      };

      if (kind === 'chart') {
        response.chartType = chartType;
        response.chartDescription = chartDescription;
        response.suggestedDataMapping = suggestedDataMapping;
        response.guidance = `Chart document created. When working with CSV data, use the configureChart tool to specify column mappings. Example mappings for ${chartType} charts: ${JSON.stringify(DATA_MAPPING_EXAMPLES[chartType as keyof typeof DATA_MAPPING_EXAMPLES]?.example || {}, null, 2)}`;
      }

      return response;
    },
  });
