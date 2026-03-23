import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarCategoriesQuery = (params: ResourceList) => {
	return useQuery(trpc.carCategories.list.queryOptions(params));
};
