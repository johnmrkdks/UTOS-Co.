import { createFileRoute } from "@tanstack/react-router";
import { GuestCarBookingPage } from "@/features/guest/_pages/guest-car-booking-page";
import { getOrCreateGuestSession } from "@/utils/auth";
import { z } from "zod";

const bookCarSearchSchema = z.object({
	quote: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/book-car/$carId")({
	validateSearch: bookCarSearchSchema,
	beforeLoad: async () => {
		// Ensure guest session exists (creates anonymous if needed)
		const session = await getOrCreateGuestSession();
		return { session };
	},
	component: GuestCarBookingPage,
});