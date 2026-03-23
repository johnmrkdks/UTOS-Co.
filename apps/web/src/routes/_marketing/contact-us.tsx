import { createFileRoute } from "@tanstack/react-router";
import { ContactUs } from "@/features/marketing/_pages/contact-us/_components";

export const Route = createFileRoute("/_marketing/contact-us")({
	component: RouteComponent,
});

function RouteComponent() {
	return <ContactUs />;
}
