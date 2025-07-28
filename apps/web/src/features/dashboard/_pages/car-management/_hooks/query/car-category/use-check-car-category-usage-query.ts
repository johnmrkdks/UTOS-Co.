
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { CheckCarCategoryUsageParams } from "server/types";

export const useCheckCarCategoryUsageQuery = (params: CheckCarCategoryUsageParams) => {
	return useQuery(trpc.carCategories.checkUsage.queryOptions(params));
};
