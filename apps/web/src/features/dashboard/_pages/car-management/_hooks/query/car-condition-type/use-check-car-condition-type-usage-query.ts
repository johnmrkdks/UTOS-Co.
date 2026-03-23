import { useQuery } from "@tanstack/react-query";
import type { CheckCarConditionTypeUsageParams } from "server/types";
import { trpc } from "@/trpc";

export const useCheckCarConditionTypeUsageQuery = (
	params: CheckCarConditionTypeUsageParams,
) => {
	return useQuery(trpc.carConditionTypes.checkUsage.queryOptions(params));
};
