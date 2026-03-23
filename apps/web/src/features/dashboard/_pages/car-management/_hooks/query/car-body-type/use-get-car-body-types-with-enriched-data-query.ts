import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarBodyTypesWithEnrichedDataQuery = (
	params: ResourceList,
) => {
	return useQuery(trpc.carBodyTypes.listWithEnrichedData.queryOptions(params));
};
