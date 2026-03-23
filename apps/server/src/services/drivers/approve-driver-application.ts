import { z } from "zod";
import { updateDriverData } from "@/data/drivers/update-driver";
import type { DB } from "@/db";

export const ApproveDriverApplicationServiceSchema = z.object({
	driverId: z.string().cuid2(),
	approved: z.boolean(),
	notes: z.string().optional(),
	approvedBy: z.string().cuid2(),
});

export type ApproveDriverApplicationServiceInput = z.infer<
	typeof ApproveDriverApplicationServiceSchema
>;

export const approveDriverApplicationService = async (
	db: DB,
	data: ApproveDriverApplicationServiceInput,
) => {
	const updateData = {
		id: data.driverId,
		isApproved: data.approved,
		onboardingStatus: data.approved
			? ("approved" as const)
			: ("rejected" as const),
		onboardingNotes: data.notes,
		approvedAt: data.approved ? new Date() : null,
		approvedBy: data.approvedBy,
		isActive: data.approved, // Only activate if approved
		updatedAt: new Date(),
	};

	return await updateDriverData(db, updateData);
};
