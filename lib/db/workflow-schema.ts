import { pgTable, text, timestamp, uuid, primaryKey } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { user } from './schema';

export const workflow = pgTable(
  'Workflow',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'), // JSON content with workflow nodes and edges
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Workflow = InferSelectModel<typeof workflow>;
