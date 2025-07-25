
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarBodyTypesQuery = (params: ResourceList) => {
	return useQuery(trpc.carBodyTypes.list.queryOptions(params));
};
