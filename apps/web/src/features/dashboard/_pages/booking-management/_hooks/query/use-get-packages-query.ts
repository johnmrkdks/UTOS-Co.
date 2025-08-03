import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetPackagesQuery = (params: ResourceList) => {
	return useQuery(trpc.packages.list.queryOptions(params));
};