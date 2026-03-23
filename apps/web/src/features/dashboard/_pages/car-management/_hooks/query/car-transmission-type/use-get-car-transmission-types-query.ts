import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarTransmissionTypesQuery = (params: ResourceList) => {
	return useQuery(trpc.carTransmissionTypes.list.queryOptions(params));
};
