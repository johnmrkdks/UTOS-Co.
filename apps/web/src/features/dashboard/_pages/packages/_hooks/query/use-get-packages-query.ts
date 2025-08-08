import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

type UseGetPackagesQueryOptions = {
	limit?: number;
	offset?: number;
	enabled?: boolean;
};

export function useGetPackagesQuery(options: UseGetPackagesQueryOptions = {}) {
	const { limit = 10, offset = 0, enabled = true } = options;

	return useQuery({
		queryKey: ["packages", { limit, offset }],
		queryFn: () => trpc.packages.list.query({ limit, offset }),
		enabled,
	});
}