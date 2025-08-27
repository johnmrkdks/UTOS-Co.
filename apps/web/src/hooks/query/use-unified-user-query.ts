import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getOrCreateGuestSession } from "@/utils/auth";

/**
 * Unified user query that works for both authenticated and guest users
 * Returns session data for both types with a unified interface
 */
export const useUnifiedUserQuery = () => {
	return useQuery({
		queryKey: ["unified-user"],
		queryFn: async () => {
			const session = await getOrCreateGuestSession();
			return session;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});
};

/**
 * Helper function to extract user information from either authenticated or guest session
 */
export const extractUserInfo = (session: any) => {
	if (session?.user) {
		// Authenticated user
		return {
			id: session.user.id,
			name: session.user.name || "",
			email: session.user.email || "",
			isGuest: false,
		};
	} else if (session?.session?.userId) {
		// Guest user
		return {
			id: session.session.userId,
			name: "",
			email: "",
			isGuest: true,
		};
	}
	return null;
};