import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarConditionTypesQuery = (params: ResourceList) => {
	return useQuery(trpc.carConditionTypes.list.queryOptions(params));
};
