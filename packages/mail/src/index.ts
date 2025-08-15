export { MailService } from "./mail-service";
export * from "./types";
export * from "./templates";

// Factory function for creating mail service instances
import type { MailConfig } from "./types";
import { MailService } from "./mail-service";

let mailServiceInstance: MailService | null = null;

export function createMailService(config: MailConfig): MailService {
	return new MailService(config);
}

export function getMailService(env: any): MailService {
	if (!mailServiceInstance) {
		const config: MailConfig = {
			clientId: env.GOOGLE_CLIENT_ID || env.GMAIL_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET || env.GMAIL_CLIENT_SECRET,
			refreshToken: env.GOOGLE_EMAIL_REFRESH_TOKEN || env.GMAIL_REFRESH_TOKEN,
			user: env.GOOGLE_EMAIL_USER || env.GMAIL_USER,
		};

		mailServiceInstance = new MailService(config);
	}
	return mailServiceInstance;
}