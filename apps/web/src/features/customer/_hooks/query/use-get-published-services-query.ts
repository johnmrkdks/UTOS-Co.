import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetPublishedServicesQuery = (params: ResourceList) => {
	return useQuery(trpc.packages.listPublished.queryOptions(params));
};
