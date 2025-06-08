import { pgTable, varchar, text, timestamp, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';
import { user } from './schema';

export const dashboard = pgTable(
  'Dashboard',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'), // JSON content with charts and CSV data
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

export type Dashboard = InferSelectModel<typeof dashboard>; 