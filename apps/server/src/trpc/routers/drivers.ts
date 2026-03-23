import { z } from "zod";
import {
	AssignDriverServiceSchema,
	assignDriverService,
} from "@/services/bookings/assign-driver";
import {
	ApproveDriverApplicationServiceSchema,
	approveDriverApplicationService,
} from "@/services/drivers/approve-driver-application";
import {
	CreateDriverApplicationServiceSchema,
	createDriverApplicationService,
} from "@/services/drivers/create-driver-application";
import {
	DeleteDriverServiceSchema,
	deleteDriverService,
} from "@/services/drivers/delete-driver";
import { getAvailableDriversService } from "@/services/drivers/get-available-drivers";
import {
	GetCurrentDriverServiceSchema,
	getCurrentDriverService,
} from "@/services/drivers/get-current-driver";
import { getDriversService } from "@/services/drivers/get-drivers";
import {
	GetDriversByStatusServiceSchema,
	getDriversByStatusService,
} from "@/services/drivers/get-drivers-by-status";
import {
	UpdateDriverServiceSchema,
	updateDriverService,
} from "@/services/drivers/update-driver";
import {
	UpdateDriverProfileServiceSchema,
	updateDriverProfileService,
} from "@/services/drivers/update-driver-profile";
import {
	VerifyDriverDocumentsServiceSchema,
	verifyDriverDocumentsService,
} from "@/services/drivers/verify-driver-documents";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const driversRouter = router({
	current: protectedProcedure.query(async ({ ctx: { db, session } }) => {
		try {
			if (!session?.user?.id) {
				throw new Error("Unauthorized");
			}
			const driver = await getCurrentDriverService(db, {
				userId: session.user.id,
			});
			return driver;
		} catch (error) {
			handleTRPCError(error);
		}
	}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const drivers = await getDriversService(db, input);
				return drivers;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	available: protectedProcedure
		.input(
			z
				.object({
					timeSlot: z
						.object({
							start: z.coerce.date(),
							end: z.coerce.date(),
						})
						.optional(),
				})
				.optional(),
		)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const drivers = await getAvailableDriversService(db, input?.timeSlot);
				return drivers;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	createApplication: protectedProcedure
		.input(CreateDriverApplicationServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newDriver = await createDriverApplicationService(db, input);
				return newDriver[0];
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateDriverServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedDriver = await updateDriverService(db, input);
				return updatedDriver;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	listByStatus: protectedProcedure
		.input(GetDriversByStatusServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const drivers = await getDriversByStatusService(db, input);
				return drivers;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	approveApplication: protectedProcedure
		.input(ApproveDriverApplicationServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedDriver = await approveDriverApplicationService(db, input);
				return updatedDriver[0];
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	assignToBooking: protectedProcedure
		.input(AssignDriverServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedBooking = await assignDriverService(db, input);
				return updatedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteDriverServiceSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				// TODO: Add proper admin role check when session.user.role is available
				if (!session?.user?.id) {
					throw new Error("Unauthorized: Authentication required");
				}

				const result = await deleteDriverService(db, input);
				return result;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	updateProfile: protectedProcedure
		.input(UpdateDriverProfileServiceSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				if (!session?.user?.id) {
					throw new Error("Unauthorized: Authentication required");
				}

				const result = await updateDriverProfileService(db, input);
				return result;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	verifyDocuments: protectedProcedure
		.input(VerifyDriverDocumentsServiceSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				if (!session?.user?.id) {
					throw new Error("Unauthorized: Admin access required");
				}
				const result = await verifyDriverDocumentsService(db, {
					...input,
					verifiedBy: session.user.id,
				});
				return result;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});
