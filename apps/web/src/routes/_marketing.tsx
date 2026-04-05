import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { MarketingFooter } from "@/features/marketing/_components/footer/marketing-footer";
import { MarketingNavbar } from "@/features/marketing/_components/marketing-navbar";

export const Route = createFileRoute("/_marketing")({
	component: RouteComponent,
});

function RouteComponent() {
	const location = useLocation();
	const isStandalonePage =
		location.pathname.startsWith("/driver-job/") ||
		location.pathname.startsWith("/track/") ||
		location.pathname.startsWith("/pay/");

	if (isStandalonePage) {
		return <Outlet />;
	}

	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
			<MarketingNavbar className="sticky top-0 z-20 border-border/50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65" />
			<main className="flex-1">
				<Outlet />
			</main>
			<MarketingFooter />
		</div>
	);
}
