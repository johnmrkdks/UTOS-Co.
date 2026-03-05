import { DetailReports } from "@/features/dashboard/_pages/reports/_components/detail-reports";
import { ReportOverview } from "@/features/dashboard/_pages/reports/_components/overview";
import { createFileRoute } from "@tanstack/react-router";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";

export const Route = createFileRoute("/admin/dashboard/_layout/report/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PaddingLayout className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-bold">Reports</h1>
				<p className="text-muted-foreground">Booking and performance metrics</p>
			</div>
			<ReportOverview />
			<DetailReports />
		</PaddingLayout>
	);
}
