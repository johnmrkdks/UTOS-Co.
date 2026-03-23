import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useGetAvailableCarsQuery = () => {
	return useQuery(
		trpc.cars.listPublished.queryOptions({
			limit: 10, // Get more cars for selection
			offset: 0,
		}),
	);
};
