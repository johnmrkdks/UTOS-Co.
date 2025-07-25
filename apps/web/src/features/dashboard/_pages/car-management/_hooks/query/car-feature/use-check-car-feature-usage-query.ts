
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { CheckCarFeatureUsageParams } from "server/types";

export const useCheckCarFeatureUsageQuery = (params: CheckCarFeatureUsageParams) => {
	return useQuery(trpc.carFeatures.checkUsage.queryOptions(params));
};
