
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { CheckCarConditionTypeUsageParams } from "server/types";

export const useCheckCarConditionTypeUsageQuery = (params: CheckCarConditionTypeUsageParams) => {
	return useQuery(trpc.carConditionTypes.checkUsage.queryOptions(params));
};
