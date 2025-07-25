
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { CheckCarConditionTypeUsageServiceSchema } from "server/src/services/cars-condition-types/check-car-condition-type-usage";

export const useCheckCarConditionTypeUsageQuery = (options: CheckCarConditionTypeUsageServiceSchema) => {
	return useQuery(trpc.carConditionTypes.checkUsage.queryOptions(options));
};
