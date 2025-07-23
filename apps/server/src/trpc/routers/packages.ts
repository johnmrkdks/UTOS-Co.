import {
	InsertPackageSchema,
	UpdatePackageSchema,
} from "@/schemas/shared/tables/package";
import { createPackageService, CreatePackageServiceSchema } from "@/services/packages/create-package";
import { deletePackageService, DeletePackageServiceSchema } from "@/services/packages/delete-package";
import { getPackageService, GetPackageServiceSchema } from "@/services/packages/get-package";
import { getPackagesService } from "@/services/packages/get-packages";
import { updatePackageService, UpdatePackageServiceSchema } from "@/services/packages/update-package";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { z } from "zod";

export const packagesRouter = router({
	create: protectedProcedure
		.input(CreatePackageServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newPackage = await createPackageService(db, input);
				return newPackage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeletePackageServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedPackage = await deletePackageService(db, input);
				return deletedPackage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetPackageServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const packageItem = await getPackageService(db, input);
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
		.input(UpdatePackageServiceSchema)
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

