import { useQuery } from "@tanstack/react-query";
import type { CheckCarFuelTypeUsageParams } from "server/types";
import { trpc } from "@/trpc";

export const useCheckCarFuelTypeUsageQuery = (
	params: CheckCarFuelTypeUsageParams,
) => {
	return useQuery(trpc.carFuelTypes.checkUsage.queryOptions(params));
};
