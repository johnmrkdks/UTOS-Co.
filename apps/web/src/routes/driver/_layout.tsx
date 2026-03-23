import { createFileRoute, redirect } from "@tanstack/react-router";
import { DriverLayout } from "@/features/driver/_components/layout";
import { requireDriver } from "@/utils/auth";

export const Route = createFileRoute("/driver/_layout")({
	beforeLoad: async () => {
		// This will redirect if not authenticated or not a driver
		await requireDriver();
	},
	component: DriverLayout,
});
