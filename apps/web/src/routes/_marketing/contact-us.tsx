import { ContactUs } from "@/features/marketing/_pages/contact-us/_components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/contact-us")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			<ContactUs />
		</main>
	);
}
