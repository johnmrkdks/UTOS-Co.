import {
	InsertRatingSchema,
	UpdateRatingSchema,
} from "@/schemas/shared/tables/rating";
import { createRatingService, CreateRatingServiceSchema } from "@/services/ratings/create-rating";
import { deleteRatingService, DeleteRatingServiceSchema } from "@/services/ratings/delete-rating";
import { getRatingService, GetRatingServiceSchema } from "@/services/ratings/get-rating";
import { getRatingsService } from "@/services/ratings/get-ratings";
import { updateRatingService, UpdateRatingServiceSchema } from "@/services/ratings/update-rating";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const ratingsRouter = router({
	create: protectedProcedure
		.input(CreateRatingServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newRating = await createRatingService(db, input);
				return newRating;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteRatingServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedRating = await deleteRatingService(db, input);
				return deletedRating;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetRatingServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const rating = await getRatingService(db, input);
				return rating;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const ratings = await getRatingsService(db, input);
				return ratings;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateRatingServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedRating = await updateRatingService(db, input);
				return updatedRating;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

