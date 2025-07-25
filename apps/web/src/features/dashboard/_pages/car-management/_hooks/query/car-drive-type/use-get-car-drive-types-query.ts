
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarDriveTypesQuery = (params: ResourceList) => {
	return useQuery(trpc.carDriveTypes.list.queryOptions(params));
};
