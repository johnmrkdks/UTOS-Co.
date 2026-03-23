import { z } from "zod";
import {
	createPackageRoute,
	deletePackageRoute,
	getPackageRoutesByPackageId,
	reorderPackageRoutes,
	updatePackageRoute,
} from "@/services/packages/package-routes";
import { publicProcedure, router } from "@/trpc/init";

export const packageRoutesRouter = router({
	getByPackageId: publicProcedure
		.input(z.object({ packageId: z.string() }))
		.query(async ({ ctx, input }) => {
			return getPackageRoutesByPackageId(ctx.db, input.packageId);
		}),

	create: publicProcedure
		.input(
			z.object({
				packageId: z.string(),
				stopOrder: z.number(),
				locationName: z.string().min(1, "Location name is required"),
				address: z.string().min(1, "Address is required"),
				latitude: z.number().optional(),
				longitude: z.number().optional(),
				estimatedDuration: z.number().optional(),
				isPickupPoint: z.boolean().default(false),
				isDropoffPoint: z.boolean().default(false),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return createPackageRoute(ctx.db, input);
		}),

	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				stopOrder: z.number(),
				locationName: z.string().min(1, "Location name is required"),
				address: z.string().min(1, "Address is required"),
				latitude: z.number().optional(),
				longitude: z.number().optional(),
				estimatedDuration: z.number().optional(),
				isPickupPoint: z.boolean().default(false),
				isDropoffPoint: z.boolean().default(false),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			return updatePackageRoute(ctx.db, id, data);
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return deletePackageRoute(ctx.db, input.id);
		}),

	reorder: publicProcedure
		.input(
			z.object({
				packageId: z.string(),
				routeOrders: z.array(
					z.object({
						id: z.string(),
						stopOrder: z.number(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return reorderPackageRoutes(ctx.db, input.packageId, input.routeOrders);
		}),
});
