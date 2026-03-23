import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarFuelTypesQuery = (params: ResourceList) => {
	return useQuery(trpc.carFuelTypes.list.queryOptions(params));
};
