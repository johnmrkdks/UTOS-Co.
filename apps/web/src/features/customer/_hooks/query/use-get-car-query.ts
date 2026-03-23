import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useGetCarQuery = (
	params: { id: string },
	options?: { enabled?: boolean },
) => {
	return useQuery({
		...trpc.cars.getPublished.queryOptions(params),
		enabled: options?.enabled ?? true,
	});
};
