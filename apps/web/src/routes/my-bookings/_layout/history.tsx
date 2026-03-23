import { createFileRoute } from "@tanstack/react-router";
import { CustomerHistoryPage } from "@/features/customer/_pages/history-page";

export const Route = createFileRoute("/my-bookings/_layout/history")({
	component: CustomerHistoryPage,
});
