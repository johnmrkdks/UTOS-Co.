import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

type UseGetAvailableDriversQueryOptions = {
	timeSlot?: {
		start: Date;
		end: Date;
	};
	enabled?: boolean;
};

export function useGetAvailableDriversQuery(
	options: UseGetAvailableDriversQueryOptions = {},
) {
	const { timeSlot, enabled = true } = options;

	return useQuery({
		...trpc.drivers.available.queryOptions({ timeSlot }),
		enabled,
	});
}
