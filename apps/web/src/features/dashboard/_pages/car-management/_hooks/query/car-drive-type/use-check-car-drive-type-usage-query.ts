import { useQuery } from "@tanstack/react-query";
import type { CheckCarDriveTypeUsageParams } from "server/types";
import { trpc } from "@/trpc";

export const useCheckCarDriveTypeUsageQuery = (
	params: CheckCarDriveTypeUsageParams,
) => {
	return useQuery(trpc.carDriveTypes.checkUsage.queryOptions(params));
};
