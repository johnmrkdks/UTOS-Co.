import { createFileRoute } from "@tanstack/react-router";
import { UsersManagementPage } from "@/features/dashboard/_pages/users-management/users-management-page";
import { requireSuperAdmin } from "@/utils/auth";

export const Route = createFileRoute("/admin/dashboard/_layout/users/")({
	component: RouteComponent,
	beforeLoad: requireSuperAdmin,
});

function RouteComponent() {
	return <UsersManagementPage />;
}
