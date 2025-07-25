import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { GetCarBrandByIdParams } from "server/types";

export const useCheckCarBrandUsageQuery = (params: GetCarBrandByIdParams) => {
	return useQuery(trpc.carBrands.checkCarBrandUsage.queryOptions(params));
};
