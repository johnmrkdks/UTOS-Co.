import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

type UseGetDriversQueryOptions = {
	limit?: number;
	offset?: number;
	enabled?: boolean;
};

export function useGetDriversQuery(options: UseGetDriversQueryOptions = {}) {
	const { limit = 10, offset = 0, enabled = true } = options;

	return useQuery({
		queryKey: ["drivers", { limit, offset }],
		queryFn: () => trpc.drivers.list.query({ limit, offset }),
		enabled,
	});
}