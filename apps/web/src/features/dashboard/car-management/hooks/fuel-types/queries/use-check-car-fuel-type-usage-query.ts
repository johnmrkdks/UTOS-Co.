import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useCheckCarFuelTypeUsageQuery = (id: string) => {
	return useQuery(trpc.carFuelTypes.checkCarFuelTypeUsage.queryOptions({ id }));
};
