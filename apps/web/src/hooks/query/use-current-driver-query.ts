import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useCurrentDriverQuery = () => {
	return useQuery(trpc.drivers.current.queryOptions());
};
