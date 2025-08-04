import { About } from "@/features/marketing/_pages/about/_components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/about-us")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<About />
		</main>
	);
}
