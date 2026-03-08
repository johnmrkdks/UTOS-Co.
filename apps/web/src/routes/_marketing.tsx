import { MarketingNavbar } from "@/features/marketing/_components/marketing-navbar";
import { MarketingFooter } from "@/features/marketing/_components/footer/marketing-footer";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing")({
	component: RouteComponent,
});

function RouteComponent() {
	const location = useLocation();
	const isStandalonePage = location.pathname.startsWith("/driver-job/") || location.pathname.startsWith("/track/");

	if (isStandalonePage) {
		return <Outlet />;
	}

	return (
		<div className="min-h-screen flex flex-col">
			<MarketingNavbar className="sticky top-0 z-20" />
			<main className="flex-1">
				<Outlet />
			</main>
			<MarketingFooter />
		</div>
	);
}
