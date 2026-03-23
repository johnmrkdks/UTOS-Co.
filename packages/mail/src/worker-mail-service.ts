/**
 * Resend-based mail service for Cloudflare Workers.
 * Nodemailer/SMTP does not work in Workers (no raw TCP). Resend uses HTTP.
 */

import {
	generateAccountVerificationTemplate,
	generateBookingConfirmationTemplate,
	generateDriverOnboardingTemplate,
	generateInvoiceTemplate,
	generatePasswordResetTemplate,
} from "./templates";
import type { BookingDetails, EmailOptions, InvoiceData } from "./types";

const RESEND_API_URL = "https://api.resend.com/emails";

export interface WorkerMailConfig {
	resendApiKey: string;
	fromEmail: string;
	fromName?: string;
}

export class WorkerMailService {
	private config: WorkerMailConfig;

	constructor(config: WorkerMailConfig) {
		this.config = config;
	}

	async sendEmail(options: EmailOptions): Promise<boolean> {
		try {
			const from = this.config.fromName
				? `${this.config.fromName} <${this.config.fromEmail}>`
				: this.config.fromEmail;

			const response = await fetch(RESEND_API_URL, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.config.resendApiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					from,
					to: options.to,
					subject: options.subject,
					html: options.html,
				}),
			});

			if (!response.ok) {
				const errBody = await response.text();
				console.error("❌ RESEND: API error:", response.status, errBody);
				return false;
			}

			const data = (await response.json()) as { id?: string };
			console.log("✅ RESEND: Email sent:", data.id);
			return true;
		} catch (error) {
			console.error("❌ RESEND: Send failed:", error);
			return false;
		}
	}

	async sendAccountVerification(
		to: string,
		verificationToken: string,
		baseUrl: string,
	): Promise<boolean> {
		const template = generateAccountVerificationTemplate(
			verificationToken,
			baseUrl,
		);
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
		});
	}

	async sendPasswordReset(
		to: string,
		resetToken: string,
		baseUrl: string,
	): Promise<boolean> {
		const template = generatePasswordResetTemplate(resetToken, baseUrl);
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
		});
	}

	async sendDriverOnboarding(
		to: string,
		driverName: string,
		loginUrl: string,
	): Promise<boolean> {
		const template = generateDriverOnboardingTemplate(driverName, loginUrl);
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
		});
	}

	async sendBookingConfirmation(
		to: string,
		customerName: string,
		bookingDetails: BookingDetails,
	): Promise<boolean> {
		const template = generateBookingConfirmationTemplate(
			customerName,
			bookingDetails,
		);
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
		});
	}

	async sendInvoice(
		to: string,
		customerName: string,
		bookingId: string,
		invoiceData: InvoiceData,
	): Promise<boolean> {
		const template = generateInvoiceTemplate(
			customerName,
			bookingId,
			invoiceData,
		);
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
		});
	}
}
