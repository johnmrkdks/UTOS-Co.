import { protectedProcedure, router } from "@/trpc/init";

export const carsRouter = router({
	get: protectedProcedure.query(({ ctx: { db } }) => {
		return {
			message: "This is private",
		};
	}),
});
