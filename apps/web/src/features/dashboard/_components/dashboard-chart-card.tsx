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
				"relative gap-0 overflow-hidden rounded-2xl border-border/50 bg-card/90 py-0 shadow-[0_1px_0_0_oklch(1_0_0/0.85)_inset,0_10px_36px_-18px_oklch(0.35_0.03_260/0.12)] ring-1 ring-black/[0.035]",
				className,
			)}
			{...props}
		>
			<div
				className="h-1 w-full shrink-0 bg-gradient-to-r from-amber-800/50 via-amber-600/35 to-stone-500/25"
				aria-hidden
			/>
			<div className="flex flex-col gap-6 py-6">{children}</div>
		</Card>
	);
}
