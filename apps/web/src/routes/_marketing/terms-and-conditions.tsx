import { createFileRoute } from "@tanstack/react-router";
import { TermsAndConditions } from "@/features/marketing/_pages/terms-and-conditions/_components";

export const Route = createFileRoute("/_marketing/terms-and-conditions")({
	component: RouteComponent,
});

function RouteComponent() {
	return <TermsAndConditions />;
}
