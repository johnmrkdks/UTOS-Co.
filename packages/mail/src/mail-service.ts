import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { MailConfig, EmailOptions, BookingDetails, InvoiceData } from "./types";
import {
	generateAccountVerificationTemplate,
	generatePasswordResetTemplate,
	generateDriverOnboardingTemplate,
	generateBookingConfirmationTemplate,
	generateInvoiceTemplate,
} from "./templates";

export class MailService {
	private config: MailConfig;
	private oauth2Client: OAuth2Client;

	constructor(config: MailConfig) {
		this.config = config;
		this.oauth2Client = new OAuth2Client(
			config.clientId,
			config.clientSecret,
			"https://developers.google.com/oauthplayground"
		);
		this.oauth2Client.setCredentials({
			refresh_token: config.refreshToken,
		});
	}

	private async createTransporter(): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> {
		try {
			// Always refresh OAuth2 token to avoid expired token issues
			console.log("📧 MAIL SERVICE: Refreshing OAuth2 access token...");
			const accessToken = await this.oauth2Client.getAccessToken();

			if (!accessToken.token) {
				throw new Error("Failed to get OAuth2 access token");
			}

			console.log("📧 MAIL SERVICE: Creating Gmail transporter...");
			const transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					type: "OAuth2",
					user: this.config.user,
					clientId: this.config.clientId,
					clientSecret: this.config.clientSecret,
					refreshToken: this.config.refreshToken,
					accessToken: accessToken.token,
				},
				// Reduce timeouts to fail faster if there are connectivity issues
				connectionTimeout: 15000, // 15 seconds (reduced from 30)
				socketTimeout: 15000, // 15 seconds (reduced from 30)
				greetingTimeout: 10000, // 10 seconds for initial connection
				// Disable pooling to avoid connection reuse issues with OAuth2 tokens
				pool: false,
				// Add debug logging for development
				debug: process.env.NODE_ENV === 'development',
				logger: process.env.NODE_ENV === 'development',
			} as SMTPTransport.Options);

			// Don't cache transporter to always use fresh OAuth2 tokens
			console.log("📧 MAIL SERVICE: Gmail transporter created successfully");
			return transporter;
		} catch (error) {
			console.error("❌ MAIL SERVICE: Error creating mail transporter:", error);
			throw new Error(`Failed to create mail transporter: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async sendEmail(options: EmailOptions, retries: number = 2): Promise<boolean> {
		const maxRetries = retries;

		for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
			try {
				console.log(`📧 MAIL SERVICE: Email send attempt ${attempt}/${maxRetries + 1} to ${options.to}`);

				const transporter = await this.createTransporter();

				const mailOptions = {
					from: `Down Under Chauffeurs <${this.config.user}>`,
					to: options.to,
					subject: options.subject,
					html: options.html,
					attachments: options.attachments,
				};

				console.log(`📧 MAIL SERVICE: Sending email with subject: "${options.subject}"`);

				// Reduce timeout to 20 seconds to fail faster
				const sendPromise = transporter.sendMail(mailOptions);
				const timeoutPromise = new Promise((_, reject) => {
					setTimeout(() => reject(new Error('Email send timeout after 20 seconds')), 20000);
				});

				const result = await Promise.race([sendPromise, timeoutPromise]) as any;

				console.log("✅ MAIL SERVICE: Email sent successfully:", result.messageId);

				// Close transporter after successful send
				try {
					await transporter.close();
				} catch (closeError) {
					console.warn("Warning: Could not close transporter:", closeError);
				}

				return true;
			} catch (error) {
				console.error(`❌ MAIL SERVICE: Email send attempt ${attempt} failed:`, error);

				// Note: No transporter caching - each attempt creates fresh transporter

				// If this was the last attempt, return false
				if (attempt > maxRetries) {
					console.error(`❌ MAIL SERVICE: All ${maxRetries + 1} email send attempts failed for ${options.to}`);
					return false;
				}

				// Wait before retrying (exponential backoff)
				const waitTime = Math.min(2000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
				console.log(`⏳ MAIL SERVICE: Waiting ${waitTime}ms before retry...`);
				await new Promise(resolve => setTimeout(resolve, waitTime));
			}
		}

		return false;
	}

	// Cleanup method (no longer needed since we don't cache transporters)
	async cleanup(): Promise<void> {
		console.log("📧 MAIL SERVICE: Cleanup called - no cached transporters to clean");
	}

	async sendAccountVerification(to: string, verificationToken: string, baseUrl: string): Promise<boolean> {
		const template = generateAccountVerificationTemplate(verificationToken, baseUrl);
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
		});
	}

	async sendPasswordReset(to: string, resetToken: string, baseUrl: string): Promise<boolean> {
		const template = generatePasswordResetTemplate(resetToken, baseUrl);
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
		});
	}

	async sendDriverOnboarding(to: string, driverName: string, loginUrl: string): Promise<boolean> {
		const template = generateDriverOnboardingTemplate(driverName, loginUrl);
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
		});
	}

	async sendBookingConfirmation(to: string, customerName: string, bookingDetails: BookingDetails): Promise<boolean> {
		const template = generateBookingConfirmationTemplate(customerName, bookingDetails);
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
		});
	}

	async sendInvoice(to: string, customerName: string, bookingId: string, invoiceData: InvoiceData): Promise<boolean> {
		const template = generateInvoiceTemplate(customerName, bookingId, invoiceData);
		return this.sendEmail({
			to,
			subject: template.subject,
			html: template.html,
		});
	}
}