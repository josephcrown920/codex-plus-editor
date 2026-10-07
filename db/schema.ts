import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const projects=sqliteTable('projects',{id:text('id').primaryKey(),name:text('name').notNull(),data:text('data').notNull(),revision:integer('revision').notNull().default(1),updatedAt:integer('updated_at').notNull()});
export const connections=sqliteTable('connections',{id:text('id').primaryKey(),encrypted:text('encrypted').notNull()});
