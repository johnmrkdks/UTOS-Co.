export { MailService } from "./mail-service";
export * from "./types";
export * from "./templates";
export * from "./react-templates";

// Factory function for creating mail service instances
import type { MailConfig } from "./types";
import { MailService } from "./mail-service";

// Use a WeakMap to store instances per environment configuration
const mailServiceInstances = new Map<string, MailService>();

export function createMailService(config: MailConfig): MailService {
	return new MailService(config);
}

export function getMailService(env: any): MailService {
	// Create a cache key based on the configuration
	const cacheKey = `${env.GOOGLE_CLIENT_ID || env.GMAIL_CLIENT_ID}_${env.GOOGLE_EMAIL_USER || env.GMAIL_USER}`;

	if (!mailServiceInstances.has(cacheKey)) {
		const config: MailConfig = {
			clientId: env.GOOGLE_CLIENT_ID || env.GMAIL_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET || env.GMAIL_CLIENT_SECRET,
			refreshToken: env.GOOGLE_EMAIL_REFRESH_TOKEN || env.GMAIL_REFRESH_TOKEN,
			user: env.GOOGLE_EMAIL_USER || env.GMAIL_USER,
		};

		mailServiceInstances.set(cacheKey, new MailService(config));
	}

	return mailServiceInstances.get(cacheKey)!;
}

// Add cleanup function for all instances
export async function cleanupAllMailServices(): Promise<void> {
	const cleanupPromises = Array.from(mailServiceInstances.values()).map(service =>
		service.cleanup().catch(error => console.error('Error cleaning up mail service:', error))
	);

	await Promise.all(cleanupPromises);
	mailServiceInstances.clear();
}