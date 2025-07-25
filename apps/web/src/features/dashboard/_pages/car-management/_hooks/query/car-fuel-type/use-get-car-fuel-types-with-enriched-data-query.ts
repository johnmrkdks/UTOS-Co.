
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarFuelTypesWithEnrichedDataQuery = (params: ResourceList) => {
	return useQuery(trpc.carFuelTypes.listWithEnrichedData.queryOptions(params));
};
