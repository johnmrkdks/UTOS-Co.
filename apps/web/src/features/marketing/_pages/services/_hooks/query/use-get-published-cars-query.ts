import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetPublishedCarsQuery = (params: ResourceList) => {
	return useQuery(trpc.cars.listPublished.queryOptions(params));
};
