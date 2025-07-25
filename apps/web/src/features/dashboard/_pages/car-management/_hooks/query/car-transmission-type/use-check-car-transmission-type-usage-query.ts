
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { CheckCarTransmissionTypeUsageServiceSchema } from "server/src/services/cars-transmission-types/check-car-transmission-type-usage";

export const useCheckCarTransmissionTypeUsageQuery = (options: CheckCarTransmissionTypeUsageServiceSchema) => {
	return useQuery(trpc.carTransmissionTypes.checkUsage.queryOptions(options));
};
