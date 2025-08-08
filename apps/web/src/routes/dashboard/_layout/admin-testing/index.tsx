import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/utils/auth";
import { AdminTestingPage } from "@/features/dashboard/_pages/admin-testing";

export const Route = createFileRoute("/dashboard/_layout/admin-testing/")({
	beforeLoad: requireAdmin,
	component: AdminTestingPage,
});