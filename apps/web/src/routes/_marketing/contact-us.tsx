import { ContactUs } from "@/features/marketing/_pages/contact-us/_components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/contact-us")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="bg-beige h-full min-h-svh flex justify-center items-center">
			<ContactUs className="" />
		</main>
	);
}
