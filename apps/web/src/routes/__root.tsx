import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "@workspace/ui/components/sonner";
import React from "react";
import { NotFound } from "@/components/not-found";
import { ModalProvider } from "@/hooks/use-modal";
import { useTimezoneSync } from "@/hooks/use-timezone-sync";
import { SessionProvider } from "@/providers/session-provider";
import type { trpc } from "@/trpc";

export type RouterAppContext = {
	trpc: typeof trpc;
	queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	notFoundComponent: NotFound,
	head: () => ({
		meta: [
			{
				title: "Utos & Co. — Luxury Chauffeur",
			},
			{
				name: "description",
				content:
					"Premium luxury chauffeur services in Australia. Book luxury cars, airport transfers, and corporate transportation. Professional drivers, premium vehicles, 24/7 service.",
			},
			{
				name: "keywords",
				content:
					"chauffeur service, luxury car hire, airport transfer, corporate transport, luxury transportation, premium cars, professional drivers, Australia, Utos",
			},
			{
				name: "viewport",
				content:
					"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover",
			},
			{
				name: "author",
				content: "Utos & Co.",
			},
			{
				name: "robots",
				content: "index, follow",
			},
			{
				name: "theme-color",
				content: "#1e293b",
			},
			{
				name: "msapplication-TileColor",
				content: "#1e293b",
			},
			{
				name: "msapplication-config",
				content: "/browserconfig.xml",
			},
			// Open Graph Meta Tags
			{
				property: "og:title",
				content: "Utos & Co. — Luxury Chauffeur",
			},
			{
				property: "og:description",
				content:
					"Premium luxury chauffeur services in Australia. Professional drivers, luxury vehicles, and exceptional service for all your transportation needs.",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:url",
				content: "https://utosandco.com",
			},
			{
				property: "og:image",
				content: "https://utosandco.com/utos-logo.png",
			},
			{
				property: "og:image:alt",
				content: "Utos & Co. Australia",
			},
			{
				property: "og:locale",
				content: "en_AU",
			},
			{
				property: "og:site_name",
				content: "Utos & Co.",
			},
			// Twitter Card Meta Tags
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:title",
				content: "Utos & Co. — Luxury Chauffeur",
			},
			{
				name: "twitter:description",
				content:
					"Premium luxury chauffeur services in Australia. Professional drivers, luxury vehicles, and exceptional service.",
			},
			{
				name: "twitter:image",
				content: "https://utosandco.com/utos-logo.png",
			},
			{
				name: "twitter:image:alt",
				content: "Utos & Co. Australia",
			},
			// Additional SEO Meta Tags
			{
				name: "format-detection",
				content: "telephone=yes",
			},
			{
				name: "mobile-web-app-capable",
				content: "yes",
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default",
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Utos & Co.",
			},
		],
		links: [
			/* Favicon lives in index.html + useEffect below so the tab icon is not overridden by SVG/ICO */
			{
				rel: "manifest",
				href: "/site.webmanifest",
			},
			{
				rel: "mask-icon",
				href: "/safari-pinned-tab.svg",
				color: "#1e293b",
			},
			// Canonical URL
			{
				rel: "canonical",
				href: "https://utosandco.com",
			},
			// Preconnect to external domains for performance
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
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
	type ModifierKey = "Alt" | "Control" | "Meta" | "Shift";
	type KeyboardKey = ModifierKey | (string & {});

	// Auto-sync timezone on login
	useTimezoneSync();

	// Ensure tab favicon is the brand PNG (Chromium often prefers cached SVG/ICO over PNG).
	React.useEffect(() => {
		const href = "/utos-logo.png?v=3";
		document
			.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
			.forEach((node) => {
				const el = node as HTMLLinkElement;
				const raw = el.getAttribute("href") ?? "";
				if (
					raw.includes(".svg") ||
					raw.includes("favicon.ico") ||
					raw.includes("favicon-16") ||
					raw.includes("favicon-32")
				) {
					el.remove();
				}
			});
		let icon = document.querySelector(
			'link[rel="icon"][type="image/png"]',
		) as HTMLLinkElement | null;
		if (!icon) {
			icon = document.querySelector(
				'link[rel="icon"]',
			) as HTMLLinkElement | null;
		}
		if (!icon) {
			icon = document.createElement("link");
			icon.rel = "icon";
			document.head.appendChild(icon);
		}
		icon.type = "image/png";
		icon.href = href;
	}, []);

	// Prevent iOS zoom on input focus
	React.useEffect(() => {
		const preventZoom = () => {
			const viewportMeta = document.querySelector('meta[name="viewport"]');
			if (viewportMeta) {
				viewportMeta.setAttribute(
					"content",
					"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover",
				);
			}

			// Add event listeners to all input elements
			const inputs = document.querySelectorAll("input, textarea, select");
			inputs.forEach((input) => {
				input.addEventListener("focus", () => {
					if (viewportMeta) {
						viewportMeta.setAttribute(
							"content",
							"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover",
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
		<SessionProvider>
			<ModalProvider>
				<HeadContent />
				<div className="grid h-svh grid-rows-[auto_1fr]">
					{/* {isFetching ? <Loader /> : <Outlet />} */}
					<Outlet />
				</div>
				<Toaster
					richColors
					position="top-center"
					toastOptions={{
						style: {
							marginTop: "60px", // Account for mobile header
						},
						className: "mobile:max-w-[90vw] mobile:text-sm",
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
							name: "TanStack Query",
							render: <ReactQueryDevtoolsPanel />,
						},
						{
							name: "TanStack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
			</ModalProvider>
		</SessionProvider>
	);
}
