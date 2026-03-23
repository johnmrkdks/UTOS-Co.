import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarFuelTypesWithEnrichedDataQuery = (
	params: ResourceList,
) => {
	return useQuery(trpc.carFuelTypes.listWithEnrichedData.queryOptions(params));
};
