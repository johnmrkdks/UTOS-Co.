import type { DB } from "@/db";
import type { R2Bucket } from "@cloudflare/workers-types";

export type Env = {
	DB: DB;
	BUCKET: R2Bucket;
	/** Square Payments - use sandbox for dev/staging */
	SQUARE_ACCESS_TOKEN?: string;
	SQUARE_LOCATION_ID?: string;
	SQUARE_ENVIRONMENT?: "sandbox" | "production";
	BETTER_AUTH_URL?: string;
	GOOGLE_MAPS_API_KEY?: string;
	// Email: Resend (works in Cloudflare Workers - preferred)
	RESEND_API_KEY?: string;
	RESEND_FROM_EMAIL?: string;
	RESEND_FROM_NAME?: string;
	// Email: Gmail OAuth (nodemailer - does NOT work in Workers)
	GOOGLE_CLIENT_ID?: string;
	GMAIL_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
	GMAIL_CLIENT_SECRET?: string;
	GOOGLE_EMAIL_REFRESH_TOKEN?: string;
	GMAIL_REFRESH_TOKEN?: string;
	GOOGLE_EMAIL_USER?: string;
	GMAIL_USER?: string;
};

