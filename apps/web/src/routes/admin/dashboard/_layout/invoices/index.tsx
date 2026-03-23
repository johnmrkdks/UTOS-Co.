import { createFileRoute } from "@tanstack/react-router";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { InvoicesPage } from "@/features/dashboard/_pages/invoices";

export const Route = createFileRoute("/admin/dashboard/_layout/invoices/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PaddingLayout className="invoice-print-page flex flex-col gap-6">
			<div className="print:hidden">
				<h1 className="font-bold text-2xl">Invoices</h1>
				<p className="text-muted-foreground">
					Generate driver and company invoices for completed jobs
				</p>
			</div>
			<InvoicesPage />
		</PaddingLayout>
	);
}
