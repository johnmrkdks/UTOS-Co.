import { Home } from "@/features/marketing/_pages/home/_components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Home />;
}
