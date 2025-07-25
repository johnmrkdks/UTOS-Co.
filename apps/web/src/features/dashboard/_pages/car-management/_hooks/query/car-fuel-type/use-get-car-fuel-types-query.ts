
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarFuelTypesQuery = (params: ResourceList) => {
	return useQuery(trpc.carFuelTypes.list.queryOptions(params));
};
