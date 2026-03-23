import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useCustomerProfileQuery = () => {
	return useQuery(trpc.customerProfile.getProfile.queryOptions());
};
