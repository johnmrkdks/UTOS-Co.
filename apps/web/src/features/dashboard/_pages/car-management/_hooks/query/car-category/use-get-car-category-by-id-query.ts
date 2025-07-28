
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { GetCarCategoryByIdParams } from "server/types";

export const useGetCarCategoryByIdQuery = (params: GetCarCategoryByIdParams) => {
	return useQuery(trpc.carCategories.get.queryOptions(params));
};
