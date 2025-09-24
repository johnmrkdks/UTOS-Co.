import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/trpc/init";
import { getMailService } from "@workspace/mail";
import { sendDriverAssignmentNotification, sendTripStatusNotification } from "@/services/notifications/booking-email-notification-service";

const sendEmailSchema = z.object({
	to: z.string().email(),
	subject: z.string().min(1),
	html: z.string().min(1),
});

const sendAccountVerificationSchema = z.object({
	to: z.string().email(),
	verificationToken: z.string().min(1),
	baseUrl: z.string().url(),
});

const sendPasswordResetSchema = z.object({
	to: z.string().email(),
	resetToken: z.string().min(1),
	baseUrl: z.string().url(),
});

const sendDriverOnboardingSchema = z.object({
	to: z.string().email(),
	driverName: z.string().min(1),
	loginUrl: z.string().url(),
});

const sendInvoiceSchema = z.object({
	to: z.string().email(),
	customerName: z.string().min(1),
	bookingId: z.string().min(1),
	invoiceData: z.object({
		amount: z.number().positive(),
		currency: z.string().default("AUD"),
		bookingDate: z.string(),
		serviceType: z.string(),
		route: z.string().optional(),
		packageName: z.string().optional(),
	}),
});

const sendBookingConfirmationSchema = z.object({
	to: z.string().email(),
	customerName: z.string().min(1),
	bookingDetails: z.object({
		bookingId: z.string().min(1),
		serviceType: z.string(),
		pickupDate: z.string(),
		pickupTime: z.string(),
		pickupAddress: z.string(),
		destinationAddress: z.string().optional(),
		packageName: z.string().optional(),
		driverName: z.string().optional(),
		vehicleDetails: z.string().optional(),
		amount: z.number().positive(),
		currency: z.string().default("AUD"),
	}),
});

const sendDriverAssignmentNotificationSchema = z.object({
	bookingId: z.string().min(1),
	driverId: z.string().min(1),
});

const sendTripStatusNotificationSchema = z.object({
	bookingId: z.string().min(1),
	status: z.string().min(1),
});

export const mailRouter = router({
	sendEmail: publicProcedure
		.input(sendEmailSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const mailService = getMailService(ctx.env);
				const success = await mailService.sendEmail({
					to: input.to,
					subject: input.subject,
					html: input.html,
				});

				if (!success) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to send email",
					});
				}

				return { success: true, message: "Email sent successfully" };
			} catch (error) {
				console.error("Error in sendEmail:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send email",
				});
			}
		}),

	sendAccountVerification: publicProcedure
		.input(sendAccountVerificationSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const mailService = getMailService(ctx.env);
				const success = await mailService.sendAccountVerification(
					input.to,
					input.verificationToken,
					input.baseUrl
				);

				if (!success) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to send verification email",
					});
				}

				return { success: true, message: "Verification email sent successfully" };
			} catch (error) {
				console.error("Error in sendAccountVerification:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send verification email",
				});
			}
		}),

	sendPasswordReset: publicProcedure
		.input(sendPasswordResetSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const mailService = getMailService(ctx.env);
				const success = await mailService.sendPasswordReset(
					input.to,
					input.resetToken,
					input.baseUrl
				);

				if (!success) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to send password reset email",
					});
				}

				return { success: true, message: "Password reset email sent successfully" };
			} catch (error) {
				console.error("Error in sendPasswordReset:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send password reset email",
				});
			}
		}),

	sendDriverOnboarding: publicProcedure
		.input(sendDriverOnboardingSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const mailService = getMailService(ctx.env);
				const success = await mailService.sendDriverOnboarding(
					input.to,
					input.driverName,
					input.loginUrl
				);

				if (!success) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to send driver onboarding email",
					});
				}

				return { success: true, message: "Driver onboarding email sent successfully" };
			} catch (error) {
				console.error("Error in sendDriverOnboarding:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send driver onboarding email",
				});
			}
		}),

	sendInvoice: publicProcedure
		.input(sendInvoiceSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const mailService = getMailService(ctx.env);
				const success = await mailService.sendInvoice(
					input.to,
					input.customerName,
					input.bookingId,
					input.invoiceData
				);

				if (!success) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to send invoice email",
					});
				}

				return { success: true, message: "Invoice email sent successfully" };
			} catch (error) {
				console.error("Error in sendInvoice:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send invoice email",
				});
			}
		}),

	sendBookingConfirmation: publicProcedure
		.input(sendBookingConfirmationSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const mailService = getMailService(ctx.env);
				const success = await mailService.sendBookingConfirmation(
					input.to,
					input.customerName,
					input.bookingDetails
				);

				if (!success) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to send booking confirmation email",
					});
				}

				return { success: true, message: "Booking confirmation email sent successfully" };
			} catch (error) {
				console.error("Error in sendBookingConfirmation:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send booking confirmation email",
				});
			}
		}),

	// Test endpoint for admin testing
	testEmailConnection: publicProcedure
		.input(z.object({
			testEmail: z.string().email(),
		}))
		.mutation(async ({ input, ctx }) => {
			let mailService: any = null;
			try {
				// Add timeout for the entire operation
				const testEmailPromise = (async () => {
					mailService = getMailService(ctx.env);

					// Validate configuration first
					const config = ctx.env;
					const requiredEnvVars = [
						'GOOGLE_CLIENT_ID', 'GMAIL_CLIENT_ID',
						'GOOGLE_CLIENT_SECRET', 'GMAIL_CLIENT_SECRET',
						'GOOGLE_EMAIL_REFRESH_TOKEN', 'GMAIL_REFRESH_TOKEN',
						'GOOGLE_EMAIL_USER', 'GMAIL_USER'
					];

					const hasRequiredConfig = requiredEnvVars.some(varName => (config as any)[varName]);
					if (!hasRequiredConfig) {
						throw new Error("Missing required email configuration environment variables");
					}

					const success = await mailService.sendEmail({
						to: input.testEmail,
						subject: "Down Under Chauffeur - Email System Test",
						html: `
							<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
								<h2 style="color: #2563eb;">Email System Test</h2>
								<p>This is a test email to verify that the Down Under Chauffeur email system is working correctly.</p>
								<p>If you receive this email, the OAuth 2.0 integration with Gmail is functioning properly.</p>
								<div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
									<strong>Test Details:</strong><br>
									Test sent at: ${new Date().toISOString()}<br>
									Recipient: ${input.testEmail}<br>
									Status: ✅ Connection Successful
								</div>
								<p><em>This is an automated test email from Down Under Chauffeur system.</em></p>
							</div>
						`,
					});

					return success;
				})();

				// Race with timeout
				const timeoutPromise = new Promise<boolean>((_, reject) => {
					setTimeout(() => reject(new Error('Email test timeout after 60 seconds')), 60000);
				});

				const success = await Promise.race([testEmailPromise, timeoutPromise]);

				if (!success) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to send test email - email service returned false",
					});
				}

				return {
					success: true,
					message: "Test email sent successfully",
					timestamp: new Date().toISOString(),
					recipient: input.testEmail
				};
			} catch (error) {
				console.error("Error in testEmailConnection:", error);

				// Cleanup on error
				if (mailService && typeof mailService.cleanup === 'function') {
					try {
						await mailService.cleanup();
					} catch (cleanupError) {
						console.error("Error during cleanup:", cleanupError);
					}
				}

				// Provide more specific error messages
				let errorMessage = "Failed to send test email";
				if (error instanceof Error) {
					if (error.message.includes('timeout')) {
						errorMessage = "Email test timed out - possible network connectivity issue";
					} else if (error.message.includes('IPv4') || error.message.includes('resolve')) {
						errorMessage = "Network connectivity issue - unable to resolve email server";
					} else if (error.message.includes('authentication')) {
						errorMessage = "Email authentication failed - check OAuth2 credentials";
					} else if (error.message.includes('Missing required')) {
						errorMessage = error.message;
					} else {
						errorMessage = `Email service error: ${error.message}`;
					}
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: errorMessage,
				});
			}
		}),

	// Driver assignment notification
	sendDriverAssignmentNotification: publicProcedure
		.input(sendDriverAssignmentNotificationSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const result = await sendDriverAssignmentNotification({
					bookingId: input.bookingId,
					driverId: input.driverId,
					env: ctx.env,
				});

				if (!result.success) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: result.message,
					});
				}

				return result;
			} catch (error) {
				console.error("Error in sendDriverAssignmentNotification:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error instanceof Error ? error.message : "Failed to send driver assignment notification",
				});
			}
		}),

	// Trip status notification
	sendTripStatusNotification: publicProcedure
		.input(sendTripStatusNotificationSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const result = await sendTripStatusNotification({
					bookingId: input.bookingId,
					status: input.status,
					env: ctx.env,
				});

				if (!result.success) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: result.message,
					});
				}

				return result;
			} catch (error) {
				console.error("Error in sendTripStatusNotification:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error instanceof Error ? error.message : "Failed to send trip status notification",
				});
			}
		}),
});