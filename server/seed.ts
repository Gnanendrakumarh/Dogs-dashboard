
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import dogs from "../dogs.json" assert { type: "json" };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("Seeding database with breeds");

  for (const [breed, subBreeds] of Object.entries(dogs)) {
    // Check if breed exists
    const existingBreed = await db.query.breeds.findFirst({
      where: (b, { eq }) => eq(b.name, breed),
    });

    let breedId: string;
    if (existingBreed) {
      breedId = existingBreed.id;
    } else {
      const [insertedBreed] = await db
        .insert(schema.breeds)
        .values({ name: breed })
        .returning();
      breedId = insertedBreed.id;
    }

    // Insert sub-breeds if any and not already existing
    if (subBreeds.length > 0) {
      for (const sub of subBreeds) {
        const existingSub = await db.query.subBreeds.findFirst({
          where: (sb, { and, eq }) =>
            and(eq(sb.name, sub), eq(sb.breedId, breedId)),
        });

        if (!existingSub) {
          await db.insert(schema.subBreeds).values({
            name: sub,
            breedId,
          });
        }
      }
    }
  }

  console.log("Seeding complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  pool.end();
});
