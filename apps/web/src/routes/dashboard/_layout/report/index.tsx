import { DetailReports } from "@/features/dashboard/report/components/detail-reports";
import { ReportOverview } from "@/features/dashboard/report/components/overview";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/_layout/report/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col gap-4">
			<ReportOverview />
			<DetailReports />
		</div>
	);
}
