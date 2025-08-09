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
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);
