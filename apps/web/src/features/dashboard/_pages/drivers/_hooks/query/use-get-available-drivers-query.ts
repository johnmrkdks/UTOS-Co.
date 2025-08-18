import { trpc } from "@/trpc";
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
		...trpc.drivers.available.queryOptions({ timeSlot }),
		enabled,
	});
}
