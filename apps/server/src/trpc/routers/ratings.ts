import {
	InsertRatingSchema,
	UpdateRatingSchema,
} from "@/schemas/shared/tables/rating";
import { createRatingService } from "@/services/ratings/create-rating";
import { deleteRatingService } from "@/services/ratings/delete-rating";
import { getRatingService } from "@/services/ratings/get-rating";
import { getRatingsService } from "@/services/ratings/get-ratings";
import { updateRatingService } from "@/services/ratings/update-rating";
import { protectedProcedure, router } from "@/trpc/init";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const ratingsRouter = router({
	create: protectedProcedure
		.input(InsertRatingSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newRating = await createRatingService(db, input);
			return newRating;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedRating = await deleteRatingService(db, input);
			return deletedRating;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const rating = await getRatingService(db, input);
			return rating;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const ratings = await getRatingsService(db, input);
			return ratings;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateRatingSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedRating = await updateRatingService(db, input);
			return updatedRating;
		}),
});

