import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useCustomerProfileQuery = () => {
	return useQuery(trpc.customerProfile.getProfile.queryOptions());
};