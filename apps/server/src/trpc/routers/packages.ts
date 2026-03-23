import { z } from "zod";
import {
	InsertPackageSchema,
	UpdatePackageSchema,
} from "@/schemas/shared/tables/package";
import {
	CreatePackageServiceSchema,
	createPackageService,
} from "@/services/packages/create-package";
import {
	DeletePackageServiceSchema,
	deletePackageService,
} from "@/services/packages/delete-package";
import {
	GetPackageServiceSchema,
	getPackageService,
} from "@/services/packages/get-package";
import { getPackagesService } from "@/services/packages/get-packages";
import { getPublishedPackagesService } from "@/services/packages/get-published-packages";
import {
	TogglePublishPackageServiceSchema,
	togglePublishPackageService,
} from "@/services/packages/toggle-publish-package";
import {
	UpdatePackageServiceSchema,
	updatePackageService,
} from "@/services/packages/update-package";
import { protectedProcedure, publicProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const packagesRouter = router({
	create: protectedProcedure
		.input(CreatePackageServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			console.log(
				"🔗 tRPC packages.create - Received input:",
				JSON.stringify(input, null, 2),
			);
			try {
				const newPackage = await createPackageService(db, input);
				console.log(
					"🎉 tRPC packages.create - Success:",
					JSON.stringify(newPackage, null, 2),
				);
				return newPackage;
			} catch (error) {
				console.error("💥 tRPC packages.create - Error:", error);
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
				const updatedPackage = await updatePackageService(db, input);
				return updatedPackage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	togglePublish: protectedProcedure
		.input(TogglePublishPackageServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedPackage = await togglePublishPackageService(db, input);
				return updatedPackage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Public endpoints for customer-facing functionality
	listPublished: publicProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const packages = await getPublishedPackagesService(db, input);
				return packages;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	getPublished: publicProcedure
		.input(GetPackageServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const packageItem = await getPackageService(db, input);
				if (!packageItem?.isPublished || !packageItem?.isAvailable) {
					throw new Error("Package not found or not available");
				}
				return packageItem;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});
