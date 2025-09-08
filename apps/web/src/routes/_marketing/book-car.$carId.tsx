import { createFileRoute } from "@tanstack/react-router";
import { CarBookingPage } from "@/features/guest/_pages/car-booking-page";
import { z } from "zod";

const bookCarSearchSchema = z.object({
	quote: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/book-car/$carId")({
	validateSearch: bookCarSearchSchema,
	component: CarBookingPage,
});