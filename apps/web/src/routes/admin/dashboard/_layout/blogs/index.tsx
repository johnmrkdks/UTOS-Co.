import { createFileRoute } from "@tanstack/react-router";
import { BlogManagementPage } from "@/features/dashboard/_pages/blog-management/blog-management-page";

export const Route = createFileRoute("/admin/dashboard/_layout/blogs/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <BlogManagementPage />;
}
