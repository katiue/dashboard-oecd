import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { auth } from '../(auth)/auth';
import { DashboardProvider } from '@/hooks/use-dashboard';

export default async function Page() {
  const id = generateUUID();
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  if (!chatModelFromCookie) {
    return (
      <DashboardProvider>
        <Chat
          id={id}
          initialMessages={[]}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType="private"
          isReadonly={false}
          session={session}
          autoResume={false}
        />
        <DataStreamHandler id={id} />
      </DashboardProvider>
    );
  }

  return (
    <DashboardProvider>
      <Chat
        id={id}
        initialMessages={[]}
        initialChatModel={chatModelFromCookie.value}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
      />
      <DataStreamHandler id={id} />
    </DashboardProvider>
  );
}
