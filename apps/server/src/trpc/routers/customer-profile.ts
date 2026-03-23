import { db } from "@/db";
import { users, customerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/init";
import { UpdateCustomerProfileSchema } from "@/schemas/shared/tables/customer-profile";
import { updateUserProfileService, UpdateUserProfileServiceSchema } from "@/services/users/update-user-profile";

export const customerProfileInputSchema = z.object({
	// Contact Information
	phone: z.string().optional(),
	dateOfBirth: z.date().optional(),
	
	// Address Information
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	postalCode: z.string().optional(),
	country: z.string().default("Australia"),
	
	// Emergency Contact
	emergencyContactName: z.string().optional(),
	emergencyContactPhone: z.string().optional(),
	emergencyContactRelationship: z.string().optional(),
	
	// Preferences
	preferredCarType: z.string().optional(),
	communicationPreferences: z.enum(["email", "sms", "both"]).default("email"),
});

const updateCustomerProfileSchema = customerProfileInputSchema.partial();

export const customerProfileRouter = router({
	// Update basic user information (name, phone)
	updateUserProfile: protectedProcedure
		.input(UpdateUserProfileServiceSchema.omit({ userId: true }))
		.mutation(async ({ ctx: { db, session }, input }) => {
			if (!session?.user?.id) {
				throw new Error("Unauthorized: Authentication required");
			}

			const result = await updateUserProfileService(db, {
				userId: session.user.id,
				...input,
			});
			return result;
		}),

	// Get current user's profile (user + customer profile)
	getProfile: protectedProcedure
		.query(async ({ ctx: { db, session } }) => {
			if (!session?.user?.id) {
				throw new Error("Unauthorized");
			}

			// Get user basic info
			const user = await db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					phone: users.phone,
					role: users.role,
					emailVerified: users.emailVerified,
					image: users.image,
				})
				.from(users)
				.where(eq(users.id, session.user.id))
				.limit(1);

			if (!user[0]) {
				throw new Error("User not found");
			}

			// Get customer profile if exists
			const customerProfile = await db
				.select()
				.from(customerProfiles)
				.where(eq(customerProfiles.userId, session.user.id))
				.limit(1);

			return {
				user: user[0],
				customerProfile: customerProfile[0] || null,
			};
		}),

	// Create or update customer profile
	updateProfile: protectedProcedure
		.input(updateCustomerProfileSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			if (!session?.user?.id) {
				throw new Error("Unauthorized");
			}

			// Check if profile exists
			const existingProfile = await db
				.select()
				.from(customerProfiles)
				.where(eq(customerProfiles.userId, session.user.id))
				.limit(1);

			// Calculate profile completeness
			const completeness = calculateProfileCompleteness(input);
			
			let updatedProfile;

			if (existingProfile[0]) {
				// Update existing profile
				updatedProfile = await db
					.update(customerProfiles)
					.set({
						...input,
						profileCompleteness: completeness,
						isProfileComplete: completeness >= 80,
						updatedAt: new Date(),
					})
					.where(eq(customerProfiles.userId, session.user.id))
					.returning();
			} else {
				// Create new profile
				updatedProfile = await db
					.insert(customerProfiles)
					.values({
						id: `customer_profile_${session.user.id}`,
						userId: session.user.id,
						...input,
						profileCompleteness: completeness,
						isProfileComplete: completeness >= 80,
					})
					.returning();
			}

			if (!updatedProfile[0]) {
				throw new Error("Failed to update profile");
			}

			return updatedProfile[0];
		}),

	// Get profile completeness status
	getProfileCompleteness: protectedProcedure
		.query(async ({ ctx: { db, session } }) => {
			if (!session?.user?.id) {
				throw new Error("Unauthorized");
			}

			const profile = await db
				.select()
				.from(customerProfiles)
				.where(eq(customerProfiles.userId, session.user.id))
				.limit(1);

			if (!profile[0]) {
				// No customer profile yet
				return {
					completeness: 0,
					missingFields: ["phone", "address", "emergency contact"],
					isComplete: false,
				};
			}

			const missingFields = [];
			if (!profile[0].phone) missingFields.push("phone");
			if (!profile[0].address) missingFields.push("address");
			if (!profile[0].emergencyContactName) missingFields.push("emergency contact");

			return {
				completeness: profile[0].profileCompleteness || 0,
				missingFields,
				isComplete: profile[0].isProfileComplete || false,
			};
		}),
});

// Helper function to calculate profile completeness percentage
function calculateProfileCompleteness(profile: Partial<z.infer<typeof customerProfileInputSchema>>): number {
	const requiredFields = [
		'phone', 'address', 'city', 'state', 'postalCode',
		'emergencyContactName', 'emergencyContactPhone'
	];
	
	const completedFields = requiredFields.filter(field => {
		const value = profile[field as keyof typeof profile];
		return value && value.toString().trim() !== '';
	});
	
	return Math.round((completedFields.length / requiredFields.length) * 100);
}