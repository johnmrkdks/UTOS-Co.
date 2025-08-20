import { createPackageServiceTypeService, CreatePackageServiceTypeServiceSchema } from "@/services/package-service-types/create-package-service-type";
import { deletePackageServiceTypeService, DeletePackageServiceTypeServiceSchema } from "@/services/package-service-types/delete-package-service-type";
import { getPackageServiceTypeService, GetPackageServiceTypeServiceSchema } from "@/services/package-service-types/get-package-service-type";
import { getPackageServiceTypesService } from "@/services/package-service-types/get-package-service-types";
import { updatePackageServiceTypeService, UpdatePackageServiceTypeServiceSchema } from "@/services/package-service-types/update-package-service-type";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const packageServiceTypesRouter = router({
	create: protectedProcedure
		.input(CreatePackageServiceTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newServiceType = await createPackageServiceTypeService(db, input);
				return newServiceType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const serviceTypes = await getPackageServiceTypesService(db, input);
				return serviceTypes;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	get: protectedProcedure
		.input(GetPackageServiceTypeServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const serviceType = await getPackageServiceTypeService(db, input);
				return serviceType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	update: protectedProcedure
		.input(UpdatePackageServiceTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedServiceType = await updatePackageServiceTypeService(db, input);
				return updatedServiceType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	delete: protectedProcedure
		.input(DeletePackageServiceTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedServiceType = await deletePackageServiceTypeService(db, input);
				return deletedServiceType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});