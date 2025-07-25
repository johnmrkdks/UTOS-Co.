
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarTransmissionTypesQuery = (params: ResourceList) => {
	return useQuery(trpc.carTransmissionTypes.list.queryOptions(params));
};
