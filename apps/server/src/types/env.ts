import type { DB } from "@/db";
import type { R2Bucket } from "@cloudflare/workers-types";

export type Env = {
	DB: DB;
	BUCKET: R2Bucket;
	GOOGLE_MAPS_API_KEY?: string;
};

