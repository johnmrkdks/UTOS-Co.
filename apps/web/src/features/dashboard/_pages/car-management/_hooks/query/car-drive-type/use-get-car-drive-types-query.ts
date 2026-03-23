import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarDriveTypesQuery = (params: ResourceList) => {
	return useQuery(trpc.carDriveTypes.list.queryOptions(params));
};
