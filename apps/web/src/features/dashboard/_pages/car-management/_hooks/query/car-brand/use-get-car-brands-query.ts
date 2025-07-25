import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarBrandsQuery = (params: ResourceList) => {
	return useQuery(trpc.carBrands.list.queryOptions(params));
};
