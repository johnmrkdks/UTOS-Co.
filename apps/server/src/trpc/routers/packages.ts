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
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const packagesRouter = router({
	create: protectedProcedure
		.input(InsertPackageSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newPackage = await createPackageService(db, input);
			return newPackage;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedPackage = await deletePackageService(db, input);
			return deletedPackage;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const packageItem = await getPackageService(db, input);
			return packageItem;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const packages = await getPackagesService(db, input);
			return packages;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdatePackageSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedPackage = await updatePackageService(
				db,
				input.id,
				input.data,
			);
			return updatedPackage;
		}),
});

