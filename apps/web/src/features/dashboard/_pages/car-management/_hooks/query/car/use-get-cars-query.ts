import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarsQuery = (options: ResourceList) => {
	return useQuery(trpc.cars.list.queryOptions(options));
};
