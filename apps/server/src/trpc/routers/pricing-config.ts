import { z } from "zod";
import {
	CreatePricingConfigServiceSchema,
	createPricingConfigService,
} from "@/services/pricing-config/create-pricing-config";
import {
	DeletePricingConfigServiceSchema,
	deletePricingConfigService,
} from "@/services/pricing-config/delete-pricing-config";
import { getPricingConfigsService } from "@/services/pricing-config/get-pricing-configs";
import {
	UpdatePricingConfigServiceSchema,
	updatePricingConfigService,
} from "@/services/pricing-config/update-pricing-config";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const pricingConfigRouter = router({
	create: protectedProcedure
		.input(CreatePricingConfigServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newConfig = await createPricingConfigService(db, input);
				return newConfig;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const configs = await getPricingConfigsService(db, input);
				return configs;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdatePricingConfigServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedConfig = await updatePricingConfigService(db, input);
				return updatedConfig;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeletePricingConfigServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedConfig = await deletePricingConfigService(db, input);
				return deletedConfig;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});
