import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const plugins = [adminClient()];

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_SERVER_URL,
	plugins,
	// Configure session caching to reduce unnecessary API calls
	fetchOptions: {
		// Cache session for 5 minutes (300000ms)
		cache: "default",
	},
	// Configure react-query options for session
	session: {
		// Cache time: 5 minutes
		staleTime: 5 * 60 * 1000,
		// Keep in cache for 10 minutes
		gcTime: 10 * 60 * 1000,
		// Disable automatic refetching on various events
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
	},
});
