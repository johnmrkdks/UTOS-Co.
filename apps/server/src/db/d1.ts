import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";

export const d1 = drizzle(env.DB);
