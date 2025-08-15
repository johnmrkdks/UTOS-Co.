import type { DB } from "@/db";
import { drivers, users } from "@/db/sqlite/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const GetDriversByStatusServiceSchema = z.object({
	onboardingStatus: z.enum(["pending", "documents_uploaded", "approved", "rejected"]).optional(),
});

export type GetDriversByStatusServiceInput = z.infer<typeof GetDriversByStatusServiceSchema>;

export const getDriversByStatusService = async (
	db: DB,
	data: GetDriversByStatusServiceInput,
) => {
	const query = db
		.select({
			id: drivers.id,
			userId: drivers.userId,
			userName: users.name,
			userEmail: users.email,
			licenseNumber: drivers.licenseNumber,
			licenseExpiry: drivers.licenseExpiry,
			phoneNumber: drivers.phoneNumber,
			emergencyContactName: drivers.emergencyContactName,
			emergencyContactPhone: drivers.emergencyContactPhone,
			address: drivers.address,
			dateOfBirth: drivers.dateOfBirth,
			onboardingStatus: drivers.onboardingStatus,
			onboardingNotes: drivers.onboardingNotes,
			approvedAt: drivers.approvedAt,
			approvedBy: drivers.approvedBy,
			licenseDocumentUrl: drivers.licenseDocumentUrl,
			insuranceDocumentUrl: drivers.insuranceDocumentUrl,
			backgroundCheckDocumentUrl: drivers.backgroundCheckDocumentUrl,
			profilePhotoUrl: drivers.profilePhotoUrl,
			isApproved: drivers.isApproved,
			isActive: drivers.isActive,
			rating: drivers.rating,
			totalRides: drivers.totalRides,
			createdAt: drivers.createdAt,
			updatedAt: drivers.updatedAt,
		})
		.from(drivers)
		.leftJoin(users, eq(drivers.userId, users.id));

	if (data.onboardingStatus) {
		query.where(eq(drivers.onboardingStatus, data.onboardingStatus));
	}

	return await query;
};