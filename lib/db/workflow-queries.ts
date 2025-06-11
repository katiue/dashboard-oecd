import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);
import { workflow, type Workflow } from './workflow-schema';
import { desc, eq, and } from 'drizzle-orm';
import { ChatSDKError } from '@/lib/errors';

export async function saveWorkflow({
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
      .insert(workflow)
      .values({
        id,
        title,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save workflow');
  }
}

export async function getWorkflowsByUserId({
  userId,
}: {
  userId: string;
}): Promise<Array<Workflow>> {
  try {
    return await db
      .select()
      .from(workflow)
      .where(eq(workflow.userId, userId))
      .orderBy(desc(workflow.createdAt));
  } catch (error) {
    console.error('Failed to get workflows by user ID:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to get workflows');
  }
}

export async function getWorkflowById({ 
  id,
  userId 
}: { 
  id: string;
  userId: string;
}): Promise<Workflow | null> {
  try {
    const [workflowResult] = await db
      .select()
      .from(workflow)
      .where(and(eq(workflow.id, id), eq(workflow.userId, userId)))
      .orderBy(desc(workflow.createdAt))
      .limit(1);

    return workflowResult || null;
  } catch (error) {
    console.error('Failed to get workflow by ID:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to get workflow');
  }
}

export async function deleteWorkflowById({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  try {
    return await db
      .delete(workflow)
      .where(and(eq(workflow.id, id), eq(workflow.userId, userId)))
      .returning();
  } catch (error) {
    console.error('Failed to delete workflow:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to delete workflow');
  }
}

export async function getWorkflowVersionsById({
  id,
}: {
  id: string;
}): Promise<Array<Workflow>> {
  try {
    return await db
      .select()
      .from(workflow)
      .where(eq(workflow.id, id))
      .orderBy(desc(workflow.createdAt));
  } catch (error) {
    console.error('Failed to get workflow versions:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to get workflow versions');
  }
}
