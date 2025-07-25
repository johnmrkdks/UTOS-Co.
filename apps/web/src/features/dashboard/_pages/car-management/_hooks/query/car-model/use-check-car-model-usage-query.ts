
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { CheckCarModelUsageParams } from "server/types";

export const useCheckCarModelUsageQuery = (params: CheckCarModelUsageParams) => {
	return useQuery(trpc.carModels.checkUsage.queryOptions(params));
};
