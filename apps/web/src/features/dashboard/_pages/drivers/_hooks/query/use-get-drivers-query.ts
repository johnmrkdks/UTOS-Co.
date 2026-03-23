import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetDriversQuery = (params: ResourceList) => {
	return useQuery(trpc.drivers.list.queryOptions(params));
};
