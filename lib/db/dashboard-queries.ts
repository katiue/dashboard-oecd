import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);
import { dashboard, type Dashboard } from './dashboard-schema';
import { desc, eq, and } from 'drizzle-orm';
import { ChatSDKError } from '@/lib/errors';

export async function saveDashboard({
  id,
  title,
  content,
  userId,
}: {
  id: string;
  title: string;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(dashboard)
      .values({
        id,
        title,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save dashboard');
  }
}

export async function getDashboardsByUserId({
  userId,
}: {
  userId: string;
}): Promise<Array<Dashboard>> {
  try {
    return await db
      .select()
      .from(dashboard)
      .where(eq(dashboard.userId, userId))
      .orderBy(desc(dashboard.createdAt));
  } catch (error) {
    console.error('Failed to get dashboards by user ID:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to get dashboards');
  }
}

export async function getDashboardById({ 
  id,
  userId 
}: { 
  id: string;
  userId: string;
}): Promise<Dashboard | null> {
  try {
    const [dashboardResult] = await db
      .select()
      .from(dashboard)
      .where(and(eq(dashboard.id, id), eq(dashboard.userId, userId)))
      .orderBy(desc(dashboard.createdAt))
      .limit(1);

    return dashboardResult || null;
  } catch (error) {
    console.error('Failed to get dashboard by ID:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to get dashboard');
  }
}

export async function deleteDashboardById({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  try {
    return await db
      .delete(dashboard)
      .where(and(eq(dashboard.id, id), eq(dashboard.userId, userId)))
      .returning();
  } catch (error) {
    console.error('Failed to delete dashboard:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to delete dashboard');
  }
}

export async function getDashboardVersionsById({
  id,
}: {
  id: string;
}): Promise<Array<Dashboard>> {
  try {
    return await db
      .select()
      .from(dashboard)
      .where(eq(dashboard.id, id))
      .orderBy(desc(dashboard.createdAt));
  } catch (error) {
    console.error('Failed to get dashboard versions:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to get dashboard versions');
  }
} 