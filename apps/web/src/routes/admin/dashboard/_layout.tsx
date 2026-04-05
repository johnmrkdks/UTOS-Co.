import {
	createFileRoute,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import {
	SidebarInset,
	SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { Suspense } from "react";
import { Loader } from "@/components/loader";
import { DashboardNavbar } from "@/features/dashboard/_components/dashboard-navbar";
import { DashboardSidebar } from "@/features/dashboard/_components/dashboard-sidebar";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { requireAdmin } from "@/utils/auth";

export const Route = createFileRoute("/admin/dashboard/_layout")({
	component: RouteComponent,
	beforeLoad: requireAdmin,
});

function RouteComponent() {
	const routerState = useRouterState();
	const scrollContainerRef = useScrollToTop();

	return (
		<div className="dashboard-app min-h-svh">
			<SidebarProvider>
				<DashboardSidebar />
				<SidebarInset className="relative">
					<DashboardNavbar className="sticky top-0 z-10 print:hidden" />
					<div className="flex min-h-[calc(100vh-var(--navbar-height,60px))] w-full max-w-[calc(100vw-var(--sidebar-width))] flex-1 overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,oklch(0.88_0.04_85/0.18),transparent)] bg-background">
						<div
							ref={scrollContainerRef}
							className="relative flex-1 overflow-y-auto overflow-x-hidden"
						>
							{routerState.status === "pending" && (
								<div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
									<Loader />
								</div>
							)}
							<div className="mx-auto w-full max-w-7xl">
								<Suspense fallback={<Loader />}>
									<Outlet />
								</Suspense>
							</div>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
