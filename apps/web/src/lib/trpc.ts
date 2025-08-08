import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "server/src/trpc/routers/_app";

const BASE_URL = import.meta.env.DEV 
	? "http://localhost:3000/trpc"
	: "/trpc";

export const trpc = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: BASE_URL,
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
		}),
	],
});

export type { AppRouter } from "server/src/trpc/routers/_app";