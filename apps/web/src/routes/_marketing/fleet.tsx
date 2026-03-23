import { createFileRoute } from "@tanstack/react-router";
import { Fleet } from "@/features/marketing/_pages/fleet/_components";

export const Route = createFileRoute("/_marketing/fleet")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Fleet />;
}
