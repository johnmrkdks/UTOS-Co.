import { useQuery } from "@tanstack/react-query";
import type { CheckCarCategoryUsageParams } from "server/types";
import { trpc } from "@/trpc";

export const useCheckCarCategoryUsageQuery = (
	params: CheckCarCategoryUsageParams,
) => {
	return useQuery(trpc.carCategories.checkUsage.queryOptions(params));
};
