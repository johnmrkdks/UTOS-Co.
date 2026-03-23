import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarFeaturesWithEnrichedDataQuery = (
	params: ResourceList,
) => {
	return useQuery(trpc.carFeatures.listWithEnrichedData.queryOptions(params));
};
