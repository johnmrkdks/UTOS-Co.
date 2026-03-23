import { protectedProcedure, publicProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { getDashboardAnalyticsService, GetDashboardAnalyticsServiceSchema } from "@/services/analytics/get-dashboard-analytics";
import { getReviewsForCarService, GetReviewsForCarSchema } from "@/services/reviews/get-reviews-for-car";

export const analyticsRouter = router({
	getDashboardAnalytics: protectedProcedure
		.input(GetDashboardAnalyticsServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const analytics = await getDashboardAnalyticsService(db, input);
				return analytics;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	getReviewsForCar: publicProcedure
		.input(GetReviewsForCarSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				return await getReviewsForCarService(db, input);
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});