import { createFileRoute } from "@tanstack/react-router";
import { CustomerLayout } from "@/features/customer/_components/layout/customer-layout";
import { requireCustomer } from "@/utils/auth";

export const Route = createFileRoute("/dashboard/_layout")({
	beforeLoad: async () => {
		const session = await requireCustomer();
		return { user: session.user };
	},
	component: CustomerLayout,
});
