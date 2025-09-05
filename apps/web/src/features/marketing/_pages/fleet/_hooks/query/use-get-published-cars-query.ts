import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetPublishedCarsQuery = (params: ResourceList) => {
	return useQuery(trpc.cars.listPublished.queryOptions(params));
};