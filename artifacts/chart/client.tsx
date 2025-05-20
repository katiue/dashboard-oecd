import { Artifact } from '@/components/create-artifact';
import { ChartEditor } from '@/components/chart-editor';
import { CopyIcon, RedoIcon, UndoIcon } from '@/components/icons';
import {
  BarChartIcon,
  ChartIcon,
  LineChartIcon,
  PieChartIcon,
} from '@/components/chart-icons';
import { toast } from 'sonner';

type Metadata = any;

export const chartArtifact = new Artifact<'chart', Metadata>({
  kind: 'chart',
  description: 'Useful for visualizing data with various chart types',
  initialize: async ({ documentId, setMetadata }) => {
    // Reset metadata when initializing a new chart document
    setMetadata({});
  },
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'chart-delta') {
      // Fixed the stream part type from code-delta to chart-delta
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  content: ({
    content,
    currentVersionIndex,
    isCurrentVersion,
    onSaveContent,
    status,
  }) => {
    return (
      <ChartEditor
        content={content}
        currentVersionIndex={currentVersionIndex}
        isCurrentVersion={isCurrentVersion}
        saveContent={onSaveContent}
        status={status}
      />
    );
  },
  toolbar: [
    {
      icon: <ChartIcon size={18} />,
      description: 'Create a chart',
      onClick: (context) => {
        context.appendMessage({
          role: 'user',
          content: 'Create a chart from my data',
        });
      },
    },
    {
      icon: <LineChartIcon size={18} />,
      description: 'Create a line chart',
      onClick: (context) => {
        context.appendMessage({
          role: 'user',
          content: 'Create a line chart visualization from my data',
        });
      },
    },
    {
      icon: <BarChartIcon size={18} />,
      description: 'Create a bar chart',
      onClick: (context) => {
        context.appendMessage({
          role: 'user',
          content: 'Create a bar chart visualization from my data',
        });
      },
    },
    {
      icon: <PieChartIcon size={18} />,
      description: 'Create a pie chart',
      onClick: (context) => {
        context.appendMessage({
          role: 'user',
          content: 'Create a pie chart visualization from my data',
        });
      },
    },
  ],
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy to clipboard',
      onClick: ({ content }) => {
        if (content) {
          navigator.clipboard.writeText(content);
          toast.success('Chart JSON copied to clipboard');
        }
      },
    },
    {
      icon: <BarChartIcon size={18} />,
      description: 'Latest version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('latest');
      },
    },
  ],
});
