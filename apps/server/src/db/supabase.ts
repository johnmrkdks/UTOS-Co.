import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export const supabase = drizzle(process.env.SUPABASE_DB_URI!, { schema });
