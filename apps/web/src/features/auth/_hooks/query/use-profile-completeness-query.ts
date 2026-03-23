import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useProfileCompletenessQuery = () => {
	return useQuery(trpc.customerProfile.getProfileCompleteness.queryOptions());
};
