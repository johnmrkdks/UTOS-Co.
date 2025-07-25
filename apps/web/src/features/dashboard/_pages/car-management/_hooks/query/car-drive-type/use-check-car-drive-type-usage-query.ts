
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { CheckCarDriveTypeUsageServiceSchema } from "server/src/services/cars-drive-types/check-car-drive-type-usage";

export const useCheckCarDriveTypeUsageQuery = (options: CheckCarDriveTypeUsageServiceSchema) => {
	return useQuery(trpc.carDriveTypes.checkUsage.queryOptions(options));
};
