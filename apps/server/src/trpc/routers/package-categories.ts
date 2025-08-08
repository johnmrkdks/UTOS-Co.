import { z } from "zod";
import {
	createPackageCategory,
	deletePackageCategory,
	getAllPackageCategories,
	getPackageCategoryById,
	updatePackageCategory,
} from "@/services/packages/package-categories";
import { publicProcedure, router } from "@/trpc/init";

export const packageCategoriesRouter = router({
	getAll: publicProcedure.query(async ({ ctx }) => {
		return getAllPackageCategories(ctx.db);
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return getPackageCategoryById(ctx.db, input.id);
		}),

	create: publicProcedure
		.input(
			z.object({
				name: z.string().min(1, "Name is required"),
				description: z.string().optional(),
				displayOrder: z.number().default(0),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return createPackageCategory(ctx.db, input);
		}),

	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1, "Name is required"),
				description: z.string().optional(),
				displayOrder: z.number().default(0),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			return updatePackageCategory(ctx.db, id, data);
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return deletePackageCategory(ctx.db, input.id);
		}),
});
