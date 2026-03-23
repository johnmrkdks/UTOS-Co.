import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarBodyTypesQuery = (params: ResourceList) => {
	return useQuery(trpc.carBodyTypes.list.queryOptions(params));
};
