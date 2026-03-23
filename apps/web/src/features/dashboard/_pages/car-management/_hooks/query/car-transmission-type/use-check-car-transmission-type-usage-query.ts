import { useQuery } from "@tanstack/react-query";
import type { CheckCarTransmissionTypeUsageParams } from "server/types";
import { trpc } from "@/trpc";

export const useCheckCarTransmissionTypeUsageQuery = (
	params: CheckCarTransmissionTypeUsageParams,
) => {
	return useQuery(trpc.carTransmissionTypes.checkUsage.queryOptions(params));
};
