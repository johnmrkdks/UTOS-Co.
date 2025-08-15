import { createDriverData, type CreateDataFunc } from "@/data/drivers/create-driver";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

export const CreateDriverApplicationServiceSchema = z.object({
	userId: z.string().cuid2(),
	licenseNumber: z.string().min(1, "License number is required"),
	licenseExpiry: z.date(),
	phoneNumber: z.string().min(1, "Phone number is required"),
	emergencyContactName: z.string().min(1, "Emergency contact name is required"),
	emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
	address: z.string().min(1, "Address is required"),
	dateOfBirth: z.date(),
	licenseDocumentUrl: z.string().optional(),
	insuranceDocumentUrl: z.string().optional(),
	backgroundCheckDocumentUrl: z.string().optional(),
	profilePhotoUrl: z.string().optional(),
});

export type CreateDriverApplicationServiceInput = z.infer<typeof CreateDriverApplicationServiceSchema>;

export const createDriverApplicationService = async (
	db: Parameters<CreateDataFunc>[0],
	data: CreateDriverApplicationServiceInput,
) => {
	const driverData = {
		id: createId(),
		...data,
		onboardingStatus: "documents_uploaded" as const,
		isApproved: false,
		isActive: false,
		rating: 5.0,
		totalRides: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return await createDriverData(db, driverData);
};