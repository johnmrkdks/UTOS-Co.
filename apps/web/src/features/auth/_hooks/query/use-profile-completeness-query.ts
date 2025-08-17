import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useProfileCompletenessQuery = () => {
	return useQuery(trpc.customerProfile.getProfileCompleteness.queryOptions());
};