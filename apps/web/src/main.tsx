import "@/styles/globals.css";

import { QueryClientProvider } from "@tanstack/react-query";

import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { scan } from "react-scan";
import { queryClient, trpc } from "@/trpc";
import { routeTree } from "../.tanstack/routeTree.gen";
import { Loader } from "./components/loader";
import { NotFound } from "./components/not-found";

scan({
	enabled: import.meta.env.DEV,
});

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPendingComponent: () => <Loader />,
	defaultNotFoundComponent: NotFound,
	context: { trpc, queryClient },
	// Enable TanStack Router's built-in scroll restoration
	scrollRestoration: true,
	Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

function App() {
	return (
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>
	);
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<App />);
}
