import { useQuery } from "@tanstack/react-query";
import type { GetCarCategoryByIdParams } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarCategoryByIdQuery = (
	params: GetCarCategoryByIdParams,
) => {
	return useQuery(trpc.carCategories.get.queryOptions(params));
};
