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
		if (session?.user && search.redirect) {
			navigate({
				to: search.redirect,
			});
			return;
		}

		// Auto-redirect drivers to their dashboard
		if (session?.user?.role === "driver") {
			navigate({ to: "/driver" });
		} else if (session?.user?.role === "admin" || session?.user?.role === "super_admin") {
			navigate({ to: "/admin/dashboard" });
		}
	}, [session, search.redirect, navigate]);

	return <Home />;
}
