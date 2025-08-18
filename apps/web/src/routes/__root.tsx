import { Toaster } from "@workspace/ui/components/sonner";
import type { trpc } from "@/trpc";
import type { QueryClient } from "@tanstack/react-query";
import {
	HeadContent,
	Outlet,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ModalProvider } from "@/hooks/use-modal";

export type RouterAppContext = {
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
	type ModifierKey = 'Alt' | 'Control' | 'Meta' | 'Shift';
	type KeyboardKey = ModifierKey | (string & {});

	return (
		<ModalProvider>
			<HeadContent />
			<div className="grid grid-rows-[auto_1fr] h-svh">
				{/* {isFetching ? <Loader /> : <Outlet />} */}
				<Outlet />
			</div>
			<Toaster richColors />
			<TanStackDevtools
				config={{
					position: "bottom-left",
					requireUrlFlag: true,
					urlFlag: "https://localhost:3001",
				}}
				plugins={[
					{
						name: 'TanStack Query',
						render: <ReactQueryDevtoolsPanel />,
					},
					{
						name: 'TanStack Router',
						render: <TanStackRouterDevtoolsPanel />,
					},
				]} />
		</ModalProvider>
	);
}
