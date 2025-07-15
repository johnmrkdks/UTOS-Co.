import Loader from "@/components/loader";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/features/dashboard/components/dashboard-navbar";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import { authClient } from "@/lib/auth-client";
import { requireAdmin } from "@/utils/auth";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/_layout")({
	component: RouteComponent,
	beforeLoad: requireAdmin,
});

function RouteComponent() {
	const { isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="h-screen flex flex-col items-center justify-center">
				<Loader />
			</div>
		);
	}

	return (
		<SidebarProvider>
			<DashboardSidebar />
			<SidebarInset className="relative overflow-hidden">
				<DashboardNavbar className="sticky top-0 z-10" />
				<div className="h-full bg-beige p-4 overflow-auto">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
