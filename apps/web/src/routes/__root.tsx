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
				title: "Down Under Chauffeurs - Premium Luxury Transportation Services Australia",
			},
			{
				name: "description",
				content: "Premium luxury chauffeur services in Australia. Book luxury cars, airport transfers, and corporate transportation. Professional drivers, premium vehicles, 24/7 service.",
			},
			{
				name: "keywords",
				content: "chauffeur service, luxury car hire, airport transfer, corporate transport, luxury transportation, premium cars, professional drivers, Australia",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover",
			},
			{
				name: "author",
				content: "Down Under Chauffeurs",
			},
			{
				name: "robots",
				content: "index, follow",
			},
			{
				name: "theme-color",
				content: "#22818e",
			},
			{
				name: "msapplication-TileColor",
				content: "#22818e",
			},
			{
				name: "msapplication-config",
				content: "/browserconfig.xml",
			},
			// Open Graph Meta Tags
			{
				property: "og:title",
				content: "Down Under Chauffeurs - Premium Luxury Transportation",
			},
			{
				property: "og:description",
				content: "Premium luxury chauffeur services in Australia. Professional drivers, luxury vehicles, and exceptional service for all your transportation needs.",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:url",
				content: "https://downunderchauffeurs.com",
			},
			{
				property: "og:image",
				content: "https://downunderchauffeurs.com/logo.png",
			},
			{
				property: "og:image:alt",
				content: "Down Under Chauffeurs Logo",
			},
			{
				property: "og:locale",
				content: "en_AU",
			},
			{
				property: "og:site_name",
				content: "Down Under Chauffeurs",
			},
			// Twitter Card Meta Tags
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:title",
				content: "Down Under Chauffeurs - Premium Luxury Transportation",
			},
			{
				name: "twitter:description",
				content: "Premium luxury chauffeur services in Australia. Professional drivers, luxury vehicles, and exceptional service.",
			},
			{
				name: "twitter:image",
				content: "https://downunderchauffeurs.com/logo.png",
			},
			{
				name: "twitter:image:alt",
				content: "Down Under Chauffeurs Logo",
			},
			// Additional SEO Meta Tags
			{
				name: "format-detection",
				content: "telephone=yes",
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes",
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default",
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Down Under Chauffeurs",
			},
		],
		links: [
			// Favicon and Icons
			{
				rel: "icon",
				href: "/favicon.ico",
				sizes: "32x32",
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png",
				sizes: "180x180",
			},
			{
				rel: "icon",
				href: "/favicon-32x32.png",
				sizes: "32x32",
				type: "image/png",
			},
			{
				rel: "icon",
				href: "/favicon-16x16.png",
				sizes: "16x16",
				type: "image/png",
			},
			{
				rel: "manifest",
				href: "/site.webmanifest",
			},
			{
				rel: "mask-icon",
				href: "/safari-pinned-tab.svg",
				color: "#22818e",
			},
			// Canonical URL
			{
				rel: "canonical",
				href: "https://downunderchauffeurs.com",
			},
			// Preconnect to external domains for performance
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossorigin: "anonymous",
			},
			// DNS Prefetch for external resources
			{
				rel: "dns-prefetch",
				href: "https://maps.googleapis.com",
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
