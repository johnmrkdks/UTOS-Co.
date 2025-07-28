
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarCategoriesQuery = (params: ResourceList) => {
	return useQuery(trpc.carCategories.list.queryOptions(params));
};
