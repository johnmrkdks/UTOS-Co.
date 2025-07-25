
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarConditionTypesQuery = (params: ResourceList) => {
	return useQuery(trpc.carConditionTypes.list.queryOptions(params));
};
