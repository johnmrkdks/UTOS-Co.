import { createFileRoute } from "@tanstack/react-router";
import { AboutUs } from "@/features/marketing/_pages/about-us/_components";

export const Route = createFileRoute("/_marketing/about-us")({
	component: RouteComponent,
});

function RouteComponent() {
	return <AboutUs />;
}
