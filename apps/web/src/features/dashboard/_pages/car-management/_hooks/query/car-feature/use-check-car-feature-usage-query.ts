import { useQuery } from "@tanstack/react-query";
import type { CheckCarFeatureUsageParams } from "server/types";
import { trpc } from "@/trpc";

export const useCheckCarFeatureUsageQuery = (
	params: CheckCarFeatureUsageParams,
) => {
	return useQuery(trpc.carFeatures.checkUsage.queryOptions(params));
};
