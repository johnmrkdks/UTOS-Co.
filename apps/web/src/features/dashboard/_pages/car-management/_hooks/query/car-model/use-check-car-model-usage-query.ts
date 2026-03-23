import { useQuery } from "@tanstack/react-query";
import type { CheckCarModelUsageParams } from "server/types";
import { trpc } from "@/trpc";

export const useCheckCarModelUsageQuery = (
	params: CheckCarModelUsageParams,
) => {
	return useQuery(trpc.carModels.checkUsage.queryOptions(params));
};
