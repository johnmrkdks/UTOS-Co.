import { Card } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

type DashboardChartCardProps = React.ComponentProps<typeof Card>;

/**
 * Chart / detail panels in the admin dashboard: cream card + subtle gold accent rail.
 */
export function DashboardChartCard({
	className,
	children,
	...props
}: DashboardChartCardProps) {
	return (
		<Card
			className={cn(
				"relative gap-0 overflow-hidden rounded-2xl border-border/60 py-0 shadow-sm ring-1 ring-black/[0.04]",
				className,
			)}
			{...props}
		>
			<div
				className="h-1 w-full shrink-0 bg-gradient-to-r from-amber-700/45 via-amber-500/30 to-stone-400/20"
				aria-hidden
			/>
			<div className="flex flex-col gap-6 py-6">{children}</div>
		</Card>
	);
}
