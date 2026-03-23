import { useQuery } from "@tanstack/react-query";
import type { GetCarBrandByIdParams } from "server/types";
import { trpc } from "@/trpc";

export const useCheckCarBrandUsageQuery = (params: GetCarBrandByIdParams) => {
	return useQuery(trpc.carBrands.checkCarBrandUsage.queryOptions(params));
};
