// import "dotenv/config";
// import { Pool } from "pg";
// import { drizzle } from "drizzle-orm/node-postgres";
// import * as schema from "@shared/schema";

// const connectionString = process.env.DATABASE_URL;
// if (!connectionString) {
//   throw new Error("DATABASE_URL must be set.");
// }

// export const pool = new Pool({ connectionString });
// export const db = drizzle(pool, { schema });
// db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Needed for Railway sometimes
});

export const db = drizzle(pool);


