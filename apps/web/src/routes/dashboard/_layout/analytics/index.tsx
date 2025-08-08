import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/utils/auth";
import { AdvancedAnalyticsPage } from "@/features/dashboard/_pages/analytics";

export const Route = createFileRoute("/dashboard/_layout/analytics/")({
	beforeLoad: requireAdmin,
	component: AdvancedAnalyticsPage,
});