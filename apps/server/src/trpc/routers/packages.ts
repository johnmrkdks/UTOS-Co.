import {
	InsertPackageSchema,
	UpdatePackageSchema,
} from "@/schemas/shared/tables/package";
import { createPackageService } from "@/services/packages/create-package";
import { deletePackageService } from "@/services/packages/delete-package";
import { getPackageService } from "@/services/packages/get-package";
import { getPackagesService } from "@/services/packages/get-packages";
import { updatePackageService } from "@/services/packages/update-package";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const packagesRouter = router({
	create: protectedProcedure
		.input(InsertPackageSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newPackage = await createPackageService(db, input);
				return newPackage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedPackage = await deletePackageService(db, input.id);
				return deletedPackage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const packageItem = await getPackageService(db, input.id);
				return packageItem;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const packages = await getPackagesService(db, input);
				return packages;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdatePackageSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedPackage = await updatePackageService(
					db,
					input,
				);
				return updatedPackage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

