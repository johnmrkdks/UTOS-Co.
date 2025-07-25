
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarTransmissionTypesWithEnrichedDataQuery = (params: ResourceList) => {
	return useQuery(trpc.carTransmissionTypes.listWithEnrichedData.queryOptions(params));
};
