import { MarketingNavbar } from "@/features/marketing/_components/marketing-navbar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="relative">
			<MarketingNavbar className="sticky top-0 z-20" />
			<div className=" overflow-auto">
				<Outlet />
			</div>
		</div>
	);
}
