
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarModelsQuery = (params: ResourceList) => {
	return useQuery(trpc.carModels.list.queryOptions(params));
};
