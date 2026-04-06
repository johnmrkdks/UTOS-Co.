import { Card } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

type DashboardChartCardProps = React.ComponentProps<typeof Card>;

/** Chart / detail panels — minimal bordered card. */
export function DashboardChartCard({
	className,
	children,
	...props
}: DashboardChartCardProps) {
	return (
		<Card
			className={cn(
				"relative gap-0 overflow-hidden rounded-xl border-border/60 bg-card py-0 shadow-none",
				className,
			)}
			{...props}
		>
			<div className="flex flex-col gap-5 py-5 sm:gap-6 sm:py-6">
				{children}
			</div>
		</Card>
	);
}
