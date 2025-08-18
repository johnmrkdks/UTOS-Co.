import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetPublishedServicesQuery = (params: ResourceList) => {
	return useQuery(trpc.packages.listPublished.queryOptions(params));
};