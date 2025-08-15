import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/trpc/init";
import { getMailService } from "@workspace/mail";

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
			try {
				const mailService = getMailService(ctx.env);
				const success = await mailService.sendEmail({
					to: input.testEmail,
					subject: "Down Under Chauffeur - Email System Test",
					html: `
						<h2>Email System Test</h2>
						<p>This is a test email to verify that the Down Under Chauffeur email system is working correctly.</p>
						<p>If you receive this email, the OAuth 2.0 integration with Gmail is functioning properly.</p>
						<p>Test sent at: ${new Date().toISOString()}</p>
					`,
				});

				if (!success) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to send test email",
					});
				}

				return { 
					success: true, 
					message: "Test email sent successfully",
					timestamp: new Date().toISOString()
				};
			} catch (error) {
				console.error("Error in testEmailConnection:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send test email",
				});
			}
		}),
});