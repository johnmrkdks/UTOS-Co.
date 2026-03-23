import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/admin/dashboard/_layout/todays-scheduled/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/admin/dashboard/_layout/todays-scheduled/"!</div>;
}
