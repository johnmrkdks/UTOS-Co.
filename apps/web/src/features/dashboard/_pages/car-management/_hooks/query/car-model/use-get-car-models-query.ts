import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarModelsQuery = (params: ResourceList) => {
	return useQuery(trpc.carModels.list.queryOptions(params));
};
