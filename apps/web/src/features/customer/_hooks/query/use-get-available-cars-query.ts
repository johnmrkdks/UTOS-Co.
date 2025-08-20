import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetAvailableCarsQuery = () => {
	return useQuery(trpc.cars.listPublished.queryOptions({
		limit: 10, // Get more cars for selection
		offset: 0,
	}));
};