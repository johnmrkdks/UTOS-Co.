import { cn } from "@workspace/ui/lib/utils";
import type { LucideIcon } from "lucide-react";

const accentMap = {
	gold: "from-amber-700/55 via-amber-500/40 to-stone-400/30",
	slate: "from-slate-600/55 via-slate-500/35 to-slate-400/25",
	emerald: "from-emerald-600/50 via-emerald-500/38 to-teal-400/28",
	violet: "from-violet-600/50 via-violet-500/38 to-fuchsia-400/28",
} as const;

export type DashboardKpiAccent = keyof typeof accentMap;

type DashboardKpiCardProps = {
	title: string;
	value: React.ReactNode;
	subtitle?: string;
	icon: LucideIcon;
	accent?: DashboardKpiAccent;
	className?: string;
};

export function DashboardKpiCard({
	title,
	value,
	subtitle,
	icon: Icon,
	accent = "gold",
	className,
}: DashboardKpiCardProps) {
	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.04] transition-all duration-200 hover:shadow-md",
				className,
			)}
		>
			<div
				className={cn(
					"absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
					accentMap[accent],
				)}
				aria-hidden
			/>
			<div className="flex items-start justify-between gap-3 pt-1">
				<div className="min-w-0 flex-1">
					<p className="font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.14em]">
						{title}
					</p>
					<p className="mt-2 font-bold text-3xl text-foreground tabular-nums tracking-tight">
						{value}
					</p>
					{subtitle ? (
						<p className="mt-1 text-muted-foreground text-sm">{subtitle}</p>
					) : null}
				</div>
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-foreground/85 shadow-inner">
					<Icon className="h-5 w-5" strokeWidth={1.75} />
				</div>
			</div>
		</div>
	);
}
