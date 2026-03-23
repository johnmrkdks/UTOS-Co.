import { ReportCards } from "./report-cards";

export function ReportOverview() {
	return (
		<div className="flex flex-col gap-4">
			<h2 className="font-bold text-xl">Overview</h2>
			<div>
				<ReportCards />
			</div>
		</div>
	);
}
