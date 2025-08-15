import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

type OnboardingStatus = "pending" | "documents_uploaded" | "approved" | "rejected";

export const useGetDriversByStatusQuery = (onboardingStatus?: OnboardingStatus) => {
	return useQuery(trpc.drivers.listByStatus.queryOptions({ onboardingStatus }));
};