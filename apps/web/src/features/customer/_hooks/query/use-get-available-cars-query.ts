import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetAvailableCarsQuery = () => {
	return useQuery(trpc.cars.listPublished.queryOptions({
		limit: 1, // Just get the first available car for now
		offset: 0,
	}));
};