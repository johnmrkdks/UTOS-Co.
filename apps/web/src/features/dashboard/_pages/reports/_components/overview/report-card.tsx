import { cn } from "@workspace/ui/lib/utils";
import type { LucideIcon } from "lucide-react";

type ReportCardProps = React.ComponentProps<"div"> & {
	title: string;
	value: number;
	description: string;
	icon?: LucideIcon;
};

export function ReportCard({
	title,
	description,
	value,
	icon: Icon,
	className,
	...props
}: ReportCardProps) {
	return (
		<div
			className={cn(
				"relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.04] transition-shadow hover:shadow-md",
				className,
			)}
			{...props}
		>
			<div
				className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-700/45 via-amber-500/30 to-stone-400/20"
				aria-hidden
			/>
			<div className="flex items-start justify-between gap-3 pt-0.5">
				<div className="min-w-0 flex-1">
					<p className="font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.12em]">
						{title}
					</p>
					<p className="mt-2 font-bold text-3xl text-foreground tabular-nums tracking-tight">
						{value}
					</p>
					<p className="mt-1 text-muted-foreground text-sm">{description}</p>
				</div>
				{Icon ? (
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-foreground/85 shadow-inner">
						<Icon className="h-5 w-5" strokeWidth={1.75} />
					</div>
				) : null}
			</div>
		</div>
	);
}
