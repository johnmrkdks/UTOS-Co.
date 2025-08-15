import { Home } from "@/features/marketing/_pages/home/_components";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useEffect } from "react";

export const Route = createFileRoute("/_marketing/")({
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
