import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

/**
 * User query for authenticated users only
 * Use the standard useUserQuery for session management
 */
export const useUserQuery = () => {
	return useQuery({
		queryKey: ["user-session"],
		queryFn: async () => {
			const session = await authClient.getSession();
			return session?.data || null;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});
};