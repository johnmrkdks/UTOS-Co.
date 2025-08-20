import { Loader } from "@/components/loader";
import {
	SidebarInset,
	SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { DashboardNavbar } from "@/features/dashboard/_components/dashboard-navbar";
import { DashboardSidebar } from "@/features/dashboard/_components/dashboard-sidebar";
import { requireAdmin } from "@/utils/auth";
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { Suspense } from "react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

export const Route = createFileRoute("/dashboard/_layout")({
	component: RouteComponent,
	beforeLoad: requireAdmin,
});

function RouteComponent() {
	const routerState = useRouterState();
	const scrollContainerRef = useScrollToTop();

	return (
		<SidebarProvider>
			<DashboardSidebar />
			<SidebarInset className="relative">
				<DashboardNavbar className="sticky top-0 z-10" />
				<div className="flex w-full max-w-[calc(100vw-var(--sidebar-width))] flex-1 min-h-[calc(100vh-var(--navbar-height,60px))] overflow-hidden">
					<div ref={scrollContainerRef} className="flex-1 relative overflow-y-auto overflow-x-hidden">
						{routerState.status === 'pending' && (
							<div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
								<Loader />
							</div>
						)}
						<Suspense fallback={<Loader />}>
							<Outlet />
						</Suspense>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
