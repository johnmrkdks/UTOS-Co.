import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCarFuelTypesWithEnrichedDataQuery = () => {
	return useQuery(trpc.carFuelTypes.listWithEnrichedData.queryOptions({}));
};
