import { DetailsReportsChart } from "./details-reports-chart";
import { LastDaysPerformanceCard } from "./last-days-performance-card";

export function DetailReports() {
	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-xl font-bold">Detail Reports</h2>
			<div className="grid grid-cols-3 gap-4">
				<DetailsReportsChart className="col-span-2" />
				<LastDaysPerformanceCard />
			</div>
		</div>
	);
}
