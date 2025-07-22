import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "@/trpc/init";
import { carsRouter } from "./cars";
import { carBodyTypesRouter } from "./car-body-types";
import { carBrandsRouter } from "./car-brands";
import { carConditionTypesRouter } from "./car-condition-types";
import { carDriveTypesRouter } from "./car-drive-types";
import { carFeaturesRouter } from "./car-features";
import { carFuelTypesRouter } from "./car-fuel-types";
import { carImagesRouter } from "./car-images";
import { carModelsRouter } from "./car-models";
import { carTransmissionTypesRouter } from "./car-transmission-types";
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
	carBodyTypes: carBodyTypesRouter,
	carBrands: carBrandsRouter,
	carConditionTypes: carConditionTypesRouter,
	carDriveTypes: carDriveTypesRouter,
	carFeatures: carFeaturesRouter,
	carFuelTypes: carFuelTypesRouter,
	carImages: carImagesRouter,
	carModels: carModelsRouter,
	carTransmissionTypes: carTransmissionTypesRouter,
	bookings: bookingsRouter,
	packages: packagesRouter,
	ratings: ratingsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
