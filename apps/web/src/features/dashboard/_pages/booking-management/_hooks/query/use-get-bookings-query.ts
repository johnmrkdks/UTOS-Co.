import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetBookingsQuery = (params: ResourceList) => {
	return useQuery(trpc.bookings.list.queryOptions(params));
};