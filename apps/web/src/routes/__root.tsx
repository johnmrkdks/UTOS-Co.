import Header from "@/components/header";
import Loader from "@/components/loader";
import { Toaster } from "@/components/ui/sonner";
import type { trpc } from "@/utils/trpc";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	HeadContent,
	Outlet,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../index.css";

export interface RouterAppContext {
	trpc: typeof trpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Down Under Chauffeur",
			},
			{
				name: "description",
				content: "Down Under Chauffeur Booking App",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});

	return (
		<>
			<HeadContent />
			<div className="grid grid-rows-[auto_1fr] h-svh">
				{/* {isFetching ? <Loader /> : <Outlet />} */}
				<Outlet />
			</div>
			<Toaster richColors />
			<TanStackRouterDevtools position="bottom-left" />
			<Toaster richColors />
			<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
		</>
	);
}
