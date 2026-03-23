import { InvoicesPage } from "@/features/dashboard/_pages/invoices";
import { createFileRoute } from "@tanstack/react-router";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";

export const Route = createFileRoute("/admin/dashboard/_layout/invoices/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PaddingLayout className="flex flex-col gap-6 invoice-print-page">
			<div className="print:hidden">
				<h1 className="text-2xl font-bold">Invoices</h1>
				<p className="text-muted-foreground">
					Generate driver and company invoices for completed jobs
				</p>
			</div>
			<InvoicesPage />
		</PaddingLayout>
	);
}
