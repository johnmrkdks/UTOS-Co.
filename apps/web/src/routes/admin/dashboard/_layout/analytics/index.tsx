import { createFileRoute } from "@tanstack/react-router";
import { AdvancedAnalyticsPage } from "@/features/dashboard/_pages/analytics";
import { requireAdmin } from "@/utils/auth";

export const Route = createFileRoute("/admin/dashboard/_layout/analytics/")({
	beforeLoad: requireAdmin,
	component: AdvancedAnalyticsPage,
});
