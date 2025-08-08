import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

type UseGetPricingConfigsQueryOptions = {
	limit?: number;
	offset?: number;
	enabled?: boolean;
};

export function useGetPricingConfigsQuery(options: UseGetPricingConfigsQueryOptions = {}) {
	const { limit = 10, offset = 0, enabled = true } = options;

	return useQuery({
		queryKey: ["pricing-configs", { limit, offset }],
		queryFn: () => trpc.pricingConfig.list.query({ limit, offset }),
		enabled,
	});
}