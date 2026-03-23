import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarBrandsQuery = (params: ResourceList) => {
	return useQuery(trpc.carBrands.list.queryOptions(params));
};
