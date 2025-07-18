import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "@/trpc/init";
import { carsRouter } from "./cars";
import { carsBodyTypesRouter } from "./cars-body-types";
import { carsBrandsRouter } from "./cars-brands";
import { carsConditionTypesRouter } from "./cars-condition-types";
import { carsDriveTypesRouter } from "./cars-drive-types";
import { carsFeaturesRouter } from "./cars-features";
import { carsFuelTypesRouter } from "./cars-fuel-types";
import { carsImagesRouter } from "./cars-images";
import { carsModelsRouter } from "./cars-models";
import { carsTransmissionTypesRouter } from "./cars-transmission-types";
import { bookingsRouter } from "./bookings";
import { packagesRouter } from "./packages";
import { ratingsRouter } from "./ratings";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	cars: carsRouter,
	carsBodyTypes: carsBodyTypesRouter,
	carsBrands: carsBrandsRouter,
	carsConditionTypes: carsConditionTypesRouter,
	carsDriveTypes: carsDriveTypesRouter,
	carsFeatures: carsFeaturesRouter,
	carsFuelTypes: carsFuelTypesRouter,
	carsImages: carsImagesRouter,
	carsModels: carsModelsRouter,
	carsTransmissionTypes: carsTransmissionTypesRouter,
	bookings: bookingsRouter,
	packages: packagesRouter,
	ratings: ratingsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
