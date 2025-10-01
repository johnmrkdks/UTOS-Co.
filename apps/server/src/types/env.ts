import type { DB } from "@/db";
import type { R2Bucket } from "@cloudflare/workers-types";

export type Env = {
	DB: DB;
	BUCKET: R2Bucket;
	GOOGLE_MAPS_API_KEY?: string;
	// Email configuration
	GOOGLE_CLIENT_ID?: string;
	GMAIL_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
	GMAIL_CLIENT_SECRET?: string;
	GOOGLE_EMAIL_REFRESH_TOKEN?: string;
	GMAIL_REFRESH_TOKEN?: string;
	GOOGLE_EMAIL_USER?: string;
	GMAIL_USER?: string;
};

