import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const breeds = pgTable("breeds", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subBreeds = pgTable("sub_breeds", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  breedId: uuid("breed_id").references(() => breeds.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const breedRelations = relations(breeds, ({ many }) => ({
  subBreeds: many(subBreeds),
}));

export const subBreedRelations = relations(subBreeds, ({ one }) => ({
  breed: one(breeds, {
    fields: [subBreeds.breedId],
    references: [breeds.id],
  }),
}));

export const insertBreedSchema = createInsertSchema(breeds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  subBreeds: z.array(z.string()).optional(),
});

export const insertSubBreedSchema = createInsertSchema(subBreeds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateBreedSchema = insertBreedSchema.partial().extend({
  id: z.string().uuid(),
});

export type Breed = typeof breeds.$inferSelect & {
  subBreeds?: SubBreed[];
};
export type SubBreed = typeof subBreeds.$inferSelect;
export type InsertBreed = z.infer<typeof insertBreedSchema>;
export type InsertSubBreed = z.infer<typeof insertSubBreedSchema>;
export type UpdateBreed = z.infer<typeof updateBreedSchema>;

// Keep existing user schema for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
