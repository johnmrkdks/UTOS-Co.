import { PrivacyPolicy } from "@/features/marketing/_pages/privacy/_components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/privacy")({
	component: RouteComponent,
});

function RouteComponent() {
	return <PrivacyPolicy />;
}
