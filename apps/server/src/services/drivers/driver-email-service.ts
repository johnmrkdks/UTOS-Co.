import { env } from "cloudflare:workers";
import { getMailService } from "@workspace/mail";
import {
	generateDriverEmailVerificationTemplate,
	generateDriverOnboardingTemplate,
} from "@workspace/mail/templates";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { drivers } from "@/db/sqlite/schema/drivers";
import { users } from "@/db/sqlite/schema/users";
import { auth } from "@/lib/auth";

interface SendDriverVerificationEmailInput {
	driverId: string;
	adminContactEmail?: string;
}

interface SendDriverOnboardingEmailInput {
	driverId: string;
	loginUrl: string;
	googleLinkingUrl?: string;
	adminContactEmail?: string;
}

export async function sendDriverVerificationEmail(
	input: SendDriverVerificationEmailInput,
) {
	const { driverId, adminContactEmail } = input;

	// Get driver and user information
	const driverData = await db
		.select({
			driver: drivers,
			user: users,
		})
		.from(drivers)
		.leftJoin(users, eq(drivers.userId, users.id))
		.where(eq(drivers.id, driverId))
		.get();

	if (!driverData) {
		throw new Error("Driver not found");
	}

	const { driver, user } = driverData;

	if (!user?.email) {
		throw new Error("Driver email not found");
	}

	// Generate verification URL using Better Auth
	// For now, we'll use a placeholder URL - Better Auth handles verification internally
	const verificationUrl = `${env.BETTER_AUTH_URL}/api/auth/verify-email?token=verification_token&email=${encodeURIComponent(user.email)}`;

	// Generate email template
	const template = generateDriverEmailVerificationTemplate(
		user.name || "Driver",
		verificationUrl.toString(),
		adminContactEmail,
	);

	// Send email using mail service
	const mailService = getMailService(env);
	await mailService.sendEmail({
		to: user.email,
		subject: template.subject,
		html: template.html,
	});

	// Update driver record
	await db
		.update(drivers)
		.set({
			emailVerificationSentAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(drivers.id, driverId));

	return { success: true, email: user.email };
}

export async function sendDriverOnboardingEmail(
	input: SendDriverOnboardingEmailInput,
) {
	const { driverId, loginUrl, googleLinkingUrl, adminContactEmail } = input;

	// Get driver and user information
	const driverData = await db
		.select({
			driver: drivers,
			user: users,
		})
		.from(drivers)
		.leftJoin(users, eq(drivers.userId, users.id))
		.where(eq(drivers.id, driverId))
		.get();

	if (!driverData) {
		throw new Error("Driver not found");
	}

	const { driver, user } = driverData;

	if (!user?.email) {
		throw new Error("Driver email not found");
	}

	// Check if email is verified
	if (!user.emailVerified) {
		throw new Error(
			"Driver email must be verified before sending onboarding email",
		);
	}

	// Generate email template
	const template = generateDriverOnboardingTemplate(
		user.name || "Driver",
		loginUrl,
		googleLinkingUrl,
		adminContactEmail,
	);

	// Send email using mail service
	const mailService = getMailService(env);
	await mailService.sendEmail({
		to: user.email,
		subject: template.subject,
		html: template.html,
	});

	// Update driver record
	await db
		.update(drivers)
		.set({
			onboardingEmailSentAt: new Date(),
			onboardingStatus: "email_verified", // Update status to email_verified
			updatedAt: new Date(),
		})
		.where(eq(drivers.id, driverId));

	return { success: true, email: user.email };
}

export async function markDriverEmailVerified(driverId: string) {
	// Update driver record when email verification is completed
	await db
		.update(drivers)
		.set({
			emailVerifiedAt: new Date(),
			onboardingStatus: "email_verified",
			updatedAt: new Date(),
		})
		.where(eq(drivers.id, driverId));

	return { success: true };
}
