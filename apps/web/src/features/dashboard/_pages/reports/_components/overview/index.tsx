import { ReportCards } from "./report-cards";

export function ReportOverview() {
	return (
		<div className="flex flex-col gap-4">
			<div className="border-border/60 border-b pb-3">
				<h2 className="font-semibold text-foreground text-xl tracking-tight">
					Overview
				</h2>
				<p className="mt-0.5 text-muted-foreground text-sm">
					Key booking counts from your live data
				</p>
			</div>
			<div>
				<ReportCards />
			</div>
		</div>
	);
}
