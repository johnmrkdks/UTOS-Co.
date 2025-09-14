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
import React from "react";

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
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover",
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

	// Prevent iOS zoom on input focus
	React.useEffect(() => {
		const preventZoom = () => {
			const viewportMeta = document.querySelector('meta[name="viewport"]');
			if (viewportMeta) {
				viewportMeta.setAttribute('content', 
					'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover'
				);
			}

			// Add event listeners to all input elements
			const inputs = document.querySelectorAll('input, textarea, select');
			inputs.forEach(input => {
				input.addEventListener('focus', () => {
					if (viewportMeta) {
						viewportMeta.setAttribute('content', 
							'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover'
						);
					}
				});
			});
		};

		// Run on mount and when DOM changes
		preventZoom();
		
		// Observer for dynamically added inputs
		const observer = new MutationObserver(preventZoom);
		observer.observe(document.body, { childList: true, subtree: true });

		return () => observer.disconnect();
	}, []);

	return (
		<ModalProvider>
			<HeadContent />
			<div className="grid grid-rows-[auto_1fr] h-svh">
				{/* {isFetching ? <Loader /> : <Outlet />} */}
				<Outlet />
			</div>
			<Toaster 
				richColors 
				position="top-center"
				toastOptions={{
					style: {
						marginTop: '60px', // Account for mobile header
					},
					className: 'mobile:max-w-[90vw] mobile:text-sm',
				}}
			/>
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
