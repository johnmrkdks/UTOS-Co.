
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarBodyTypesWithEnrichedDataQuery = (params: ResourceList) => {
	return useQuery(trpc.carBodyTypes.listWithEnrichedData.queryOptions(params));
};
