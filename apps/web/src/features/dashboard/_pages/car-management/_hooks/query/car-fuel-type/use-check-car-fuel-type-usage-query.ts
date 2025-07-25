
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { CheckCarFuelTypeUsageServiceSchema } from "server/src/services/cars-fuel-types/check-car-fuel-type-usage";

export const useCheckCarFuelTypeUsageQuery = (options: CheckCarFuelTypeUsageServiceSchema) => {
	return useQuery(trpc.carFuelTypes.checkUsage.queryOptions(options));
};
