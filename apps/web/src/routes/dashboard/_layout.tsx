import { Loader } from "@/components/loader";
import {
	SidebarInset,
	SidebarProvider,
} from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/features/dashboard/_components/dashboard-navbar";
import { DashboardSidebar } from "@/features/dashboard/_components/dashboard-sidebar";
import { requireAdmin } from "@/utils/auth";
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/dashboard/_layout")({
	component: RouteComponent,
	beforeLoad: requireAdmin,
});

function RouteComponent() {
	const routerState = useRouterState();

	return (
		<SidebarProvider>
			<DashboardSidebar />
			<SidebarInset className="relative overflow-hidden">
				<DashboardNavbar className="sticky top-0 z-10" />
				<div className="h-full overflow-auto relative">
					{routerState.status === 'pending' && (
						<div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
							<Loader />
						</div>
					)}
					<Suspense fallback={<Loader />}>
						<Outlet />
					</Suspense>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
