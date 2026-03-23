import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { Home } from "@/features/marketing/_pages/home/_components";
import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/utils/auth";

const homeSearchSchema = z.object({
	selectedCarId: z.string().optional(),
	origin: z.string().optional(),
	destination: z.string().optional(),
	originLat: z.string().optional(),
	originLng: z.string().optional(),
	destinationLat: z.string().optional(),
	destinationLng: z.string().optional(),
	stops: z.string().optional(),
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/")({
	validateSearch: homeSearchSchema,
	beforeLoad: async ({ search }) => {
		// Check if user is authenticated
		const session = await authClient.getSession();
		const user = session?.data?.user;

		// Only redirect authenticated non-customer users
		// Customers (role: 'user') can stay on the home page
		if (user && user.role !== "user") {
			// If there's a redirect param, use it
			if (search.redirect) {
				throw redirect({ to: search.redirect });
			}

			// Otherwise redirect to their role-based dashboard
			const dashboardPath = getDashboardPath(user.role);
			throw redirect({ to: dashboardPath });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Home />;
}
