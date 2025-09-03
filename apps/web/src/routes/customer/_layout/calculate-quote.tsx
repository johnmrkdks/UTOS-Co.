import { createFileRoute } from "@tanstack/react-router";
import { CalculateQuotePage } from "@/features/marketing/_pages/calculate-quote/calculate-quote-page";

export const Route = createFileRoute("/customer/_layout/calculate-quote")({
	component: CustomerCalculateQuotePage,
});

function CustomerCalculateQuotePage() {
	return <CalculateQuotePage isCustomerArea={true} />;
}