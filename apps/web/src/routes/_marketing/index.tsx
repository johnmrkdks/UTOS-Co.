import { Home } from "@/features/marketing/_pages/home/_components";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
});

export const Route = createFileRoute("/_marketing/")({
	validateSearch: homeSearchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { session } = useUserQuery();

	// Auto-redirect drivers to their dashboard
	useEffect(() => {
		if (session?.user?.role === "driver") {
			navigate({ to: "/driver" });
		} else if (session?.user?.role === "admin" || session?.user?.role === "super_admin") {
			navigate({ to: "/dashboard" });
		}
	}, [session, navigate]);

	return <Home />;
}
