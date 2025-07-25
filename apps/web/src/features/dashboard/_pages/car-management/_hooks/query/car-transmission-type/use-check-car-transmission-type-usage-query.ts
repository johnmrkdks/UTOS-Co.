
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { CheckCarTransmissionTypeUsageParams } from "server/types";

export const useCheckCarTransmissionTypeUsageQuery = (params: CheckCarTransmissionTypeUsageParams) => {
	return useQuery(trpc.carTransmissionTypes.checkUsage.queryOptions(params));
};
