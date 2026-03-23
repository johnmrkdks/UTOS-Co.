import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const d1 = drizzle(env.DB, {
	schema,
});
