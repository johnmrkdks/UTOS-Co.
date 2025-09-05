import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { getDashboardAnalyticsService, GetDashboardAnalyticsServiceSchema } from "@/services/analytics/get-dashboard-analytics";

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
});