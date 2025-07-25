
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarFeaturesQuery = (params: ResourceList) => {
	return useQuery(trpc.carFeatures.list.queryOptions(params));
};
