import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetPackagesQuery = (params: ResourceList) => {
	return useQuery(trpc.packages.list.queryOptions(params));
};
