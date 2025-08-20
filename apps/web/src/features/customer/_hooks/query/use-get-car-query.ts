import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCarQuery = (params: { id: string }) => {
	return useQuery(trpc.cars.get.queryOptions(params));
};