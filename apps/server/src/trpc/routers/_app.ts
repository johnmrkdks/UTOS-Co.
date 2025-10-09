import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { protectedProcedure, publicProcedure, router, guestProcedure } from "@/trpc/init";
import { carsRouter } from "./cars";
import { carBodyTypesRouter } from "./car-body-types";
import { carBrandsRouter } from "./car-brands";
import { carConditionTypesRouter } from "./car-condition-types";
import { carDriveTypesRouter } from "./car-drive-types";
import { carFeaturesRouter } from "./car-features";
import { carFuelTypesRouter } from "./car-fuel-types";
import { carModelsRouter } from "./car-models";
import { carTransmissionTypesRouter } from "./car-transmission-types";
import { bookingsRouter } from "./bookings";
import { packagesRouter } from "./packages";
import { packageCategoriesRouter } from "./package-categories";
import { packageRoutesRouter } from "./package-routes";
import { packageServiceTypesRouter } from "./package-service-types";
import { ratingsRouter } from "./ratings";
import { carCategoriesRouter } from "./car-categories";
import { fileRouter } from "./file";
import { pricingConfigRouter } from "./pricing-config";
import { driversRouter } from "./drivers";
import { adminRouter } from "./admin";
import { mailRouter } from "./mail";
import { customerProfileRouter } from "./customer-profile";
import { instantQuoteRouter } from "./instant-quote";
import { analyticsRouter } from "./analytics";
import { contactMessagesRouter } from "./contact-messages";
import { authRouter } from "./auth";
import { systemSettingsRouter } from "./system-settings";

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
	sessionDebug: guestProcedure.query(({ ctx }) => {
		return {
			message: "Session debug info",
			hasSession: !!ctx.session,
			user: ctx.session?.user || null,
			sessionInfo: ctx.session?.session || null,
			userId: ctx.session?.user?.id || ctx.session?.session?.userId || null,
		};
	}),
	files: fileRouter,
	cars: carsRouter,
	carBodyTypes: carBodyTypesRouter,
	carBrands: carBrandsRouter,
	carCategories: carCategoriesRouter,
	carConditionTypes: carConditionTypesRouter,
	carDriveTypes: carDriveTypesRouter,
	carFeatures: carFeaturesRouter,
	carFuelTypes: carFuelTypesRouter,
	carModels: carModelsRouter,
	carTransmissionTypes: carTransmissionTypesRouter,
	bookings: bookingsRouter,
	drivers: driversRouter,
	packages: packagesRouter,
	packageCategories: packageCategoriesRouter,
	packageRoutes: packageRoutesRouter,
	packageServiceTypes: packageServiceTypesRouter,
	pricingConfigs: pricingConfigRouter,
	ratings: ratingsRouter,
	admin: adminRouter,
	mail: mailRouter,
	customerProfile: customerProfileRouter,
	instantQuote: instantQuoteRouter,
	analytics: analyticsRouter,
	contactMessages: contactMessagesRouter,
	auth: authRouter,
	systemSettings: systemSettingsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
