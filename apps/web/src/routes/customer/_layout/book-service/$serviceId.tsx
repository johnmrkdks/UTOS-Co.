import { createFileRoute } from "@tanstack/react-router";
import { BookServicePage } from "@/features/customer/_pages/book-service-page";

export const Route = createFileRoute("/customer/_layout/book-service/$serviceId")({
	component: BookServicePage,
});