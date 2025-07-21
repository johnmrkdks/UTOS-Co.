import { Home } from "@/features/marketing/home/components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="bg-[url(/src/assets/images/car1.png)] bg-center bg-cover bg-no-repeat">
			<Home className="bg-white/60" />
		</main>
	);
}
