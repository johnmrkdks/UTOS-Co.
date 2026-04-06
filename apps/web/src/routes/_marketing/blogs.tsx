import { createFileRoute } from "@tanstack/react-router";
import { BlogsPage } from "@/features/marketing/_pages/blogs/_components/blogs-page";

export const Route = createFileRoute("/_marketing/blogs")({
	component: RouteComponent,
});

function RouteComponent() {
	return <BlogsPage />;
}
