import { createFileRoute } from "@tanstack/react-router";
import { InstantQuotePage } from "@/features/customer/_pages/instant-quote-page";

export const Route = createFileRoute("/customer/_layout/instant-quote")({
	component: InstantQuotePage,
});