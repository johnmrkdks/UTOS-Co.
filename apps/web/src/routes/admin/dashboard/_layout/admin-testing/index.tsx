import { createFileRoute } from "@tanstack/react-router";
import { AdminTestingPage } from "@/features/dashboard/_pages/admin-testing";
import { requireAdmin } from "@/utils/auth";

export const Route = createFileRoute("/admin/dashboard/_layout/admin-testing/")(
	{
		beforeLoad: requireAdmin,
		component: AdminTestingPage,
	},
);
