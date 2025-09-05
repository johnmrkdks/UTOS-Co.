import { createFileRoute } from "@tanstack/react-router";
import { UnifiedBookServicePage } from "@/features/customer/_pages/unified-book-service-page";

export const Route = createFileRoute("/dashboard/_layout/book-service/$serviceId")({
	component: () => {
		const { serviceId } = Route.useParams();
		return <UnifiedBookServicePage serviceId={serviceId} />;
	},
});