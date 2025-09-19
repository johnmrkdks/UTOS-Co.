import type { AppRouter } from "server/trpc/routers/_app";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			// Don't show toast for authentication errors during sign-out
			const isAuthError = error.message.toLowerCase().includes('authentication') ||
							   error.message.toLowerCase().includes('unauthorized') ||
							   error.message.toLowerCase().includes('not authenticated');

			// Check if user is actually signed out (no session)
			const isSignedOut = !document.cookie.includes('better-auth.session_token');

			// Skip showing error toast if it's an auth error and user is signed out
			if (isAuthError && isSignedOut) {
				return;
			}

			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${import.meta.env.VITE_SERVER_URL}/trpc`,
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
