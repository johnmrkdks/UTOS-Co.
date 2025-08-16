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
			const accessToken = await this.oauth2Client.getAccessToken();

			const transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					type: "OAuth2",
					user: this.config.user,
					clientId: this.config.clientId,
					clientSecret: this.config.clientSecret,
					refreshToken: this.config.refreshToken,
					accessToken: accessToken.token || "",
				},
			} as SMTPTransport.Options);

			return transporter;
		} catch (error) {
			console.error("Error creating mail transporter:", error);
			throw new Error("Failed to create mail transporter");
		}
	}

	async sendEmail(options: EmailOptions): Promise<boolean> {
		try {
			const transporter = await this.createTransporter();

			const mailOptions = {
				from: `Down Under Chauffeur <${this.config.user}>`,
				to: options.to,
				subject: options.subject,
				html: options.html,
				attachments: options.attachments,
			};

			const result = await transporter.sendMail(mailOptions);
			console.log("Email sent successfully:", result.messageId);
			return true;
		} catch (error) {
			console.error("Error sending email:", error);
			return false;
		}
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