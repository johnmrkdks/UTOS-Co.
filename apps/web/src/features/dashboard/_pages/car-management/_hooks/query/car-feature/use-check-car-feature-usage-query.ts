
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { CheckCarFeatureUsageServiceSchema } from "server/src/services/cars-features/check-car-feature-usage";

export const useCheckCarFeatureUsageQuery = (options: CheckCarFeatureUsageServiceSchema) => {
	return useQuery(trpc.carFeatures.checkUsage.queryOptions(options));
};
