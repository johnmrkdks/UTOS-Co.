import { DetailsReportsChart } from "./details-reports-chart";
import { LastDaysPerformanceCard } from "./last-days-performance-card";

export function DetailReports() {
	return (
		<div className="flex flex-col gap-4">
			<div className="border-border/60 border-b pb-3">
				<h2 className="font-semibold text-foreground text-xl tracking-tight">
					Detail reports
				</h2>
				<p className="mt-0.5 text-muted-foreground text-sm">
					Status mix and monthly snapshot
				</p>
			</div>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<DetailsReportsChart className="lg:col-span-2" />
				<LastDaysPerformanceCard />
			</div>
		</div>
	);
}
