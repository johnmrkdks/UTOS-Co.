import { createFileRoute } from "@tanstack/react-router";
import { requireCustomer } from "@/utils/auth";
import { CustomerLayout } from "@/features/customer/_components/layout/customer-layout";

export const Route = createFileRoute("/dashboard/_layout")({
	beforeLoad: async () => {
		const session = await requireCustomer();
		return { user: session.user };
	},
	component: CustomerLayout,
});
