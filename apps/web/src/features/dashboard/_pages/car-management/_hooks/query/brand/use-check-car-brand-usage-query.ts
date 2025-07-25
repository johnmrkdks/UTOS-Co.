import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useCheckCarBrandUsageQuery = (id: string) => {
	return useQuery(trpc.carBrands.checkCarBrandUsage.queryOptions({ id }));
};
