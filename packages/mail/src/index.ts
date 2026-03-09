export { MailService } from "./mail-service";
export { WorkerMailService } from "./worker-mail-service";
export * from "./types";
export * from "./templates";
export * from "./react-templates";

// Factory function for creating mail service instances
import type { MailConfig } from "./types";
import { MailService } from "./mail-service";
import { WorkerMailService } from "./worker-mail-service";

// Use Maps to store instances per environment configuration
const mailServiceInstances = new Map<string, MailService>();
const workerMailServiceInstances = new Map<string, WorkerMailService>();

export function createMailService(config: MailConfig): MailService {
	return new MailService(config);
}

export function getMailService(env: any): MailService | WorkerMailService {
	// Prefer Resend in Workers - nodemailer/SMTP does not work in Cloudflare Workers
	const resendKey = env.RESEND_API_KEY;
		if (resendKey) {
		const cacheKey = `resend_${resendKey.slice(0, 12)}`;
		if (!workerMailServiceInstances.has(cacheKey)) {
			// Resend: use verified domain or onboarding@resend.dev for testing
			const fromEmail = env.RESEND_FROM_EMAIL || env.GOOGLE_EMAIL_USER || env.GMAIL_USER || "onboarding@resend.dev";
			workerMailServiceInstances.set(
				cacheKey,
				new WorkerMailService({
					resendApiKey: resendKey,
					fromEmail,
					fromName: env.RESEND_FROM_NAME || "Down Under Chauffeurs",
				})
			);
		}
		return workerMailServiceInstances.get(cacheKey)!;
	}

	// Fallback to nodemailer (Node.js only - does NOT work in Cloudflare Workers)
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
	workerMailServiceInstances.clear();
}