import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/utils/auth";
import { PackageCategoriesPage } from "@/features/dashboard/_pages/package-categories";

export const Route = createFileRoute("/dashboard/_layout/package-categories/")({
	beforeLoad: requireAdmin,
	component: PackageCategoriesPage,
});