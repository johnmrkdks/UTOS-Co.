import { createFileRoute } from "@tanstack/react-router";
import { FAQs } from "@/features/marketing/_pages/faqs/_components";

export const Route = createFileRoute("/_marketing/faqs")({
	component: RouteComponent,
});

function RouteComponent() {
	return <FAQs />;
}
