import { drizzle } from "drizzle-orm/postgres-js";

export const supabase = drizzle(process.env.SUPABASE_DB_URI!);
