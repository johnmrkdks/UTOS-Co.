import { createFileRoute } from "@tanstack/react-router";
import { GuestCarBookingPage } from "@/features/guest/_pages/guest-car-booking-page";
import { z } from "zod";

const bookCarSearchSchema = z.object({
	quote: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/book-car/$carId")({
	validateSearch: bookCarSearchSchema,
	component: GuestCarBookingPage,
});