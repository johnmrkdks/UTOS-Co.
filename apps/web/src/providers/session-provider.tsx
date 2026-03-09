import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import type { Session } from "better-auth/types";

type SessionContextType = {
	session: Session | null;
	isPending: boolean;
	isLoading: boolean;
	isFetching: boolean;
	refetch: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
	// Use React Query directly with aggressive caching
	const { data: session, isPending, isLoading, isFetching, refetch } = useQuery({
		queryKey: ["auth-session"],
		queryFn: async () => {
			const result = await authClient.getSession();
			return result.data;
		},
		// Cache for 5 minutes
		staleTime: 5 * 60 * 1000,
		// Keep in cache for 10 minutes
		gcTime: 10 * 60 * 1000,
		// Refetch on mount if data is stale (important after login)
		refetchOnMount: "always",
		// Don't refetch on window focus
		refetchOnWindowFocus: false,
		// Don't refetch on reconnect
		refetchOnReconnect: false,
		// Retry once on failure
		retry: 1,
	});

	return (
		<SessionContext.Provider
			value={{
				session: session ?? null,
				isPending,
				isLoading,
				isFetching,
				refetch,
			}}
		>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const context = useContext(SessionContext);
	if (!context) {
		throw new Error("useSession must be used within SessionProvider");
	}
	return context;
}
