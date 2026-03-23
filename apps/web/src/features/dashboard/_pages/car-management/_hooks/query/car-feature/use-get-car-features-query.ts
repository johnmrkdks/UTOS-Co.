import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarFeaturesQuery = (params: ResourceList) => {
	return useQuery(trpc.carFeatures.list.queryOptions(params));
};
