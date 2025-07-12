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
		return <div>Loading...</div>;
	}

	return (
		<SidebarProvider>
			<DashboardSidebar />
			<SidebarInset>
				<DashboardNavbar />
				<div className="h-full bg-beige p-4">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
