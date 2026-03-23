import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetBookingsQuery = (params: ResourceList) => {
	return useQuery(trpc.bookings.list.queryOptions(params));
};
