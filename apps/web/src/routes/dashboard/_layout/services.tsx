import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/features/customer/_pages/services-page";

export const Route = createFileRoute("/dashboard/_layout/services")({
	component: ServicesPage,
});
