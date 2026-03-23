import { z } from "zod";
import { updateDriverData } from "@/data/drivers/update-driver";
import type { DB } from "@/db";
import { handleTRPCError } from "@/trpc/utils/error-handler";

export const VerifyDriverDocumentsServiceSchema = z.object({
	driverId: z.string().cuid2(),
	documentVerification: z.object({
		licenseVerified: z.boolean(),
		licenseNotes: z.string().optional(),
		insuranceVerified: z.boolean(),
		insuranceNotes: z.string().optional(),
		backgroundCheckVerified: z.boolean(),
		backgroundCheckNotes: z.string().optional(),
		profilePhotoVerified: z.boolean(),
		profilePhotoNotes: z.string().optional(),
	}),
	verifiedBy: z.string().cuid2(),
	overallStatus: z.enum(["approved", "rejected", "needs_revision"]),
	adminNotes: z.string().optional(),
});

export type VerifyDriverDocumentsServiceInput = z.infer<
	typeof VerifyDriverDocumentsServiceSchema
>;

export interface DocumentVerificationResult {
	id: string;
	verificationStatus: string;
	documentVerification: any;
	verifiedAt: Date;
	verifiedBy: string;
	adminNotes?: string;
}

export async function verifyDriverDocumentsService(
	db: DB,
	data: VerifyDriverDocumentsServiceInput,
): Promise<DocumentVerificationResult> {
	try {
		const {
			driverId,
			documentVerification,
			verifiedBy,
			overallStatus,
			adminNotes,
		} = data;

		// Determine if all documents are verified
		const allDocumentsVerified =
			documentVerification.licenseVerified &&
			documentVerification.insuranceVerified &&
			documentVerification.backgroundCheckVerified &&
			documentVerification.profilePhotoVerified;

		// Calculate verification status based on document checks and overall status
		let verificationStatus: string;
		let isApproved: boolean;
		let isActive: boolean;

		if (overallStatus === "approved" && allDocumentsVerified) {
			verificationStatus = "verified";
			isApproved = true;
			isActive = true;
		} else if (overallStatus === "rejected") {
			verificationStatus = "rejected";
			isApproved = false;
			isActive = false;
		} else if (overallStatus === "needs_revision") {
			verificationStatus = "needs_revision";
			isApproved = false;
			isActive = false;
		} else {
			verificationStatus = "pending_documents";
			isApproved = false;
			isActive = false;
		}

		// Update driver with verification details
		const updateData = {
			id: driverId,
			// Store document verification as JSON string
			documentVerification: JSON.stringify(documentVerification),
			verificationStatus,
			isApproved,
			isActive,
			verifiedAt: new Date(),
			verifiedBy,
			onboardingStatus: verificationStatus as any,
			onboardingNotes: adminNotes,
			approvedAt: isApproved ? new Date() : null,
			approvedBy: isApproved ? verifiedBy : null,
			updatedAt: new Date(),
		};

		const updatedDriver = await updateDriverData(db, updateData);

		// Email notification removed for faster implementation
		console.log(
			`Driver ${data.driverId} verification status updated to: ${overallStatus}`,
		);

		return {
			id: updatedDriver[0].id,
			verificationStatus,
			documentVerification,
			verifiedAt: new Date(),
			verifiedBy,
			adminNotes,
		};
	} catch (error) {
		console.error("Failed to verify driver documents:", error);
		throw new Error("Failed to verify driver documents");
	}
}
