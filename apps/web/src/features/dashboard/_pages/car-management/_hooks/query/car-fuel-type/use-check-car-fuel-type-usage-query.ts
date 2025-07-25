
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { CheckCarFuelTypeUsageParams } from "server/types";

export const useCheckCarFuelTypeUsageQuery = (params: CheckCarFuelTypeUsageParams) => {
	return useQuery(trpc.carFuelTypes.checkUsage.queryOptions(params));
};
