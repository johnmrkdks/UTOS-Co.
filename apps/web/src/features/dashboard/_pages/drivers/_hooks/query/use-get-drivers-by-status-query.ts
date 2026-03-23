import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

type OnboardingStatus =
	| "pending"
	| "documents_uploaded"
	| "approved"
	| "rejected";

export const useGetDriversByStatusQuery = (
	onboardingStatus?: OnboardingStatus,
) => {
	return useQuery(trpc.drivers.listByStatus.queryOptions({ onboardingStatus }));
};
