
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { CheckCarModelUsageServiceSchema } from "server/src/services/cars-models/check-car-model-usage";

export const useCheckCarModelUsageQuery = (options: CheckCarModelUsageServiceSchema) => {
	return useQuery(trpc.carModels.checkUsage.queryOptions(options));
};
