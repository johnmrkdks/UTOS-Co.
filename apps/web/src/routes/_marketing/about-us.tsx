import { About } from "@/features/marketing/about/components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/about-us")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="text-center w-10/12 mx-auto p-4">
			<About className="" />
		</main>
	);
}
