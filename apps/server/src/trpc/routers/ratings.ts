import { z } from "zod";
import {
	InsertRatingSchema,
	UpdateRatingSchema,
} from "@/schemas/shared/tables/rating";
import {
	CreateRatingServiceSchema,
	createRatingService,
} from "@/services/ratings/create-rating";
import {
	DeleteRatingServiceSchema,
	deleteRatingService,
} from "@/services/ratings/delete-rating";
import {
	GetRatingServiceSchema,
	getRatingService,
} from "@/services/ratings/get-rating";
import { getRatingsService } from "@/services/ratings/get-ratings";
import {
	UpdateRatingServiceSchema,
	updateRatingService,
} from "@/services/ratings/update-rating";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";

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
