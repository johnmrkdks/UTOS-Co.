
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarDriveTypesWithEnrichedDataQuery = (params: ResourceList) => {
	return useQuery(trpc.carDriveTypes.listWithEnrichedData.queryOptions(params));
};
