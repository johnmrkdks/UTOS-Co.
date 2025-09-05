import { createFileRoute } from "@tanstack/react-router";
import { PublicationManagementPage } from "@/features/dashboard/_pages/publication-management";

export const Route = createFileRoute("/admin/dashboard/_layout/publications/")({
	component: PublicationManagementPage,
});