import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarDriveTypesWithEnrichedDataQuery = (
	params: ResourceList,
) => {
	return useQuery(trpc.carDriveTypes.listWithEnrichedData.queryOptions(params));
};
