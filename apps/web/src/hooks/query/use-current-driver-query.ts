import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useCurrentDriverQuery = () => {
	return useQuery(trpc.drivers.current.queryOptions());
};