import { breeds, subBreeds, type Breed, type SubBreed, type InsertBreed, type InsertSubBreed, type UpdateBreed, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods (existing)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Breed methods
  getBreeds(search?: string, limit?: number, offset?: number): Promise<{ breeds: Breed[]; total: number }>;
  getBreedById(id: string): Promise<Breed | undefined>;
  getBreedByName(name: string): Promise<Breed | undefined>;
  createBreed(breed: InsertBreed): Promise<Breed>;
  updateBreed(breed: UpdateBreed): Promise<Breed | undefined>;
  deleteBreed(id: string): Promise<boolean>;
  
  // Sub-breed methods
  createSubBreed(subBreed: InsertSubBreed): Promise<SubBreed>;
  deleteSubBreed(id: string): Promise<boolean>;
  
  // Stats
  getStats(): Promise<{ totalBreeds: number; totalSubBreeds: number }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return undefined; // Not implemented for this app
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined; // Not implemented for this app
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { ...insertUser, id: randomUUID() };
    return user;
  }

  // Breed methods
  async getBreeds(search?: string, limit = 50, offset = 0): Promise<{ breeds: Breed[]; total: number }> {
    let query = db.select().from(breeds);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(breeds);

    if (search) {
      const searchCondition = ilike(breeds.name, `%${search}%`);
      query = query.where(searchCondition);
      countQuery = countQuery.where(searchCondition);
    }

    query = query.orderBy(desc(breeds.createdAt)).limit(limit).offset(offset);

    const [breedsResult, countResult] = await Promise.all([
      query,
      countQuery
    ]);

    // Fetch sub-breeds for each breed
    const breedsWithSubBreeds = await Promise.all(
      breedsResult.map(async (breed) => {
        const breedSubBreeds = await db
          .select()
          .from(subBreeds)
          .where(eq(subBreeds.breedId, breed.id))
          .orderBy(subBreeds.name);
        
        return {
          ...breed,
          subBreeds: breedSubBreeds,
        };
      })
    );

    return {
      breeds: breedsWithSubBreeds,
      total: countResult[0]?.count || 0,
    };
  }

  async getBreedById(id: string): Promise<Breed | undefined> {
    const [breed] = await db.select().from(breeds).where(eq(breeds.id, id));
    if (!breed) return undefined;

    const breedSubBreeds = await db
      .select()
      .from(subBreeds)
      .where(eq(subBreeds.breedId, breed.id))
      .orderBy(subBreeds.name);

    return {
      ...breed,
      subBreeds: breedSubBreeds,
    };
  }

  async getBreedByName(name: string): Promise<Breed | undefined> {
    const [breed] = await db.select().from(breeds).where(eq(breeds.name, name));
    if (!breed) return undefined;

    const breedSubBreeds = await db
      .select()
      .from(subBreeds)
      .where(eq(subBreeds.breedId, breed.id))
      .orderBy(subBreeds.name);

    return {
      ...breed,
      subBreeds: breedSubBreeds,
    };
  }

  async createBreed(insertBreed: InsertBreed): Promise<Breed> {
    const { subBreeds: subBreedNames, ...breedData } = insertBreed;

    const [breed] = await db
      .insert(breeds)
      .values({
        ...breedData,
        updatedAt: sql`now()`,
      })
      .returning();

    let createdSubBreeds: SubBreed[] = [];
    
    if (subBreedNames && subBreedNames.length > 0) {
      const subBreedInserts = subBreedNames.map(name => ({
        name,
        breedId: breed.id,
      }));

      createdSubBreeds = await db
        .insert(subBreeds)
        .values(subBreedInserts)
        .returning();
    }

    return {
      ...breed,
      subBreeds: createdSubBreeds,
    };
  }

  async updateBreed(updateBreed: UpdateBreed): Promise<Breed | undefined> {
    const { id, subBreeds: subBreedNames, ...breedData } = updateBreed;

    const [updatedBreed] = await db
      .update(breeds)
      .set({
        ...breedData,
        updatedAt: sql`now()`,
      })
      .where(eq(breeds.id, id))
      .returning();

    if (!updatedBreed) return undefined;

    // If sub-breeds are provided, replace all existing sub-breeds
    if (subBreedNames !== undefined) {
      // Delete existing sub-breeds
      await db.delete(subBreeds).where(eq(subBreeds.breedId, id));

      // Insert new sub-breeds
      if (subBreedNames.length > 0) {
        const subBreedInserts = subBreedNames.map(name => ({
          name,
          breedId: id,
        }));

        await db.insert(subBreeds).values(subBreedInserts);
      }
    }

    // Fetch updated breed with sub-breeds
    return await this.getBreedById(id);
  }

  async deleteBreed(id: string): Promise<boolean> {
    const result = await db.delete(breeds).where(eq(breeds.id, id));
    return (result.rowCount || 0) > 0;
  }

  async createSubBreed(subBreed: InsertSubBreed): Promise<SubBreed> {
    const [createdSubBreed] = await db
      .insert(subBreeds)
      .values(subBreed)
      .returning();

    return createdSubBreed;
  }

  async deleteSubBreed(id: string): Promise<boolean> {
    const result = await db.delete(subBreeds).where(eq(subBreeds.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getStats(): Promise<{ totalBreeds: number; totalSubBreeds: number }> {
    const [breedCount] = await db.select({ count: sql<number>`count(*)` }).from(breeds);
    const [subBreedCount] = await db.select({ count: sql<number>`count(*)` }).from(subBreeds);

    return {
      totalBreeds: breedCount?.count || 0,
      totalSubBreeds: subBreedCount?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
