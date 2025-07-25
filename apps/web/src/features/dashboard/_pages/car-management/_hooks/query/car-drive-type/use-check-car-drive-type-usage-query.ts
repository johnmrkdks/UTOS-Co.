
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { CheckCarDriveTypeUsageParams } from "server/types";

export const useCheckCarDriveTypeUsageQuery = (params: CheckCarDriveTypeUsageParams) => {
	return useQuery(trpc.carDriveTypes.checkUsage.queryOptions(params));
};
