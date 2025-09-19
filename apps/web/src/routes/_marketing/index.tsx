import { Home } from "@/features/marketing/_pages/home/_components";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useEffect } from "react";
import { z } from "zod";

const homeSearchSchema = z.object({
	selectedCarId: z.string().optional(),
	origin: z.string().optional(),
	destination: z.string().optional(),
	originLat: z.string().optional(),
	originLng: z.string().optional(),
	destinationLat: z.string().optional(),
	destinationLng: z.string().optional(),
	stops: z.string().optional(),
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/")({
	validateSearch: homeSearchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/_marketing/" });
	const { session } = useUserQuery();

	// Handle OAuth callback redirect
	useEffect(() => {
		// Don't redirect if session is still loading or user is signing out
		if (!session?.user) return;

		if (search.redirect) {
			navigate({
				to: search.redirect,
				resetScroll: true
			});
			return;
		}

		// Add a small delay for auto-redirects to prevent race conditions during sign-out
		const redirectTimer = setTimeout(() => {
			// Auto-redirect drivers to their dashboard
			if (session?.user?.role === "driver") {
				navigate({ to: "/driver", resetScroll: true });
			} else if (session?.user?.role === "admin" || session?.user?.role === "super_admin") {
				navigate({ to: "/admin/dashboard", resetScroll: true });
			}
		}, 50);

		return () => clearTimeout(redirectTimer);
	}, [session, search.redirect, navigate]);

	return <Home />;
}
