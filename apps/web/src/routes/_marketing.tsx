import Header from "@/components/header";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="min-h-10/12 relative overflow-hidden">
			<Header className="sticky top-0 z-10" />
			<div className=" overflow-auto">
				<Outlet />
			</div>
		</div>
	);
}
