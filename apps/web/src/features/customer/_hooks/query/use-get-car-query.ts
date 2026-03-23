import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetCarQuery = (params: { id: string }, options?: { enabled?: boolean }) => {
	return useQuery({
		...trpc.cars.getPublished.queryOptions(params),
		enabled: options?.enabled ?? true
	});
};