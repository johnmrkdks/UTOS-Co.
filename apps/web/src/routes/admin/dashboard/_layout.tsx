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
		<SidebarProvider>
			<DashboardSidebar />
			<SidebarInset className="relative">
				<DashboardNavbar className="sticky top-0 z-10 print:hidden" />
				<div className="flex min-h-[calc(100vh-var(--navbar-height,60px))] w-full max-w-[calc(100vw-var(--sidebar-width))] flex-1 overflow-hidden bg-gradient-to-b from-slate-50/80 via-background to-background">
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
	);
}
