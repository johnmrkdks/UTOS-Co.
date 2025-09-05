import { createFileRoute } from "@tanstack/react-router";
import { GuestServiceBookingPage } from "@/features/guest/_pages/guest-service-booking-page";
import { z } from "zod";

const bookServiceSearchSchema = z.object({
	quote: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/book-service/$serviceId")({
	validateSearch: bookServiceSearchSchema,
	component: GuestServiceBookingPage,
});