import { createFileRoute } from "@tanstack/react-router";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { DetailReports } from "@/features/dashboard/_pages/reports/_components/detail-reports";
import { ReportOverview } from "@/features/dashboard/_pages/reports/_components/overview";

export const Route = createFileRoute("/admin/dashboard/_layout/report/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PaddingLayout className="flex flex-col gap-6">
			<div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur-sm sm:p-6">
				<p className="font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
					Performance
				</p>
				<h1 className="mt-1 font-semibold text-2xl text-foreground tracking-tight sm:text-3xl">
					Reports
				</h1>
				<p className="mt-1 max-w-xl text-muted-foreground text-sm sm:text-base">
					Booking and revenue metrics with status breakdowns.
				</p>
			</div>
			<ReportOverview />
			<DetailReports />
		</PaddingLayout>
	);
}
