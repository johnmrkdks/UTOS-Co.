import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

type UseGetAvailableDriversQueryOptions = {
	timeSlot?: {
		start: Date;
		end: Date;
	};
	enabled?: boolean;
};

export function useGetAvailableDriversQuery(options: UseGetAvailableDriversQueryOptions = {}) {
	const { timeSlot, enabled = true } = options;

	return useQuery({
		queryKey: ["drivers", "available", timeSlot],
		queryFn: () => trpc.drivers.available.query({ timeSlot }),
		enabled,
	});
}