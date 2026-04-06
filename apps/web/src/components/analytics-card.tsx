import { Card, CardContent } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import {
	type LucideIcon,
	TrendingDownIcon,
	TrendingUpIcon,
} from "lucide-react";

export type AnalyticsCardData = {
	id: string;
	title: string;
	value: string | number;
	icon: LucideIcon;
	/** Backing wash — keep subtle so the rail + ring stay visible */
	bgGradient?: string;
	iconBg?: string;
	textColor?: string;
	/** Top accent bar (Tailwind gradient stops, without `bg-gradient-to-r`) */
	accentStripClassName?: string;
	changeText?: string;
	changeType?: "positive" | "negative" | "warning" | "neutral";
	showTrend?: boolean;
	showIcon?: boolean;
	showBackgroundIcon?: boolean;
};

type AnalyticsCardProps = {
	data: AnalyticsCardData;
	className?: string;
	view?: boolean | "default" | "compact";
};

const DEFAULT_STRIP = "from-amber-700/50 via-amber-500/38 to-stone-400/25";

export function AnalyticsCard({
	data,
	className,
	view = "default",
}: AnalyticsCardProps) {
	const {
		title,
		value,
		icon: Icon,
		bgGradient = "bg-gradient-to-br from-card via-card to-muted/35",
		iconBg = "bg-primary",
		textColor = "text-foreground",
		accentStripClassName = DEFAULT_STRIP,
		changeText,
		changeType = "neutral",
		showTrend = false,
		showIcon = true,
		showBackgroundIcon = true,
	} = data;

	const isCompact = view === true || view === "compact";

	return (
		<Card
			className={cn(
				"group relative gap-0 overflow-hidden rounded-xl border-border/60 py-0 shadow-none ring-0 transition-colors hover:border-border",
				bgGradient,
				className,
			)}
		>
			<div
				className={cn(
					"h-1 w-full shrink-0 bg-gradient-to-r",
					accentStripClassName,
				)}
				aria-hidden
			/>
			<CardContent
				className={cn(
					isCompact
						? "relative z-10 flex flex-row items-center gap-3 px-4 py-3"
						: "relative z-10 px-4 py-4",
				)}
			>
				{isCompact ? (
					<>
						{showIcon && (
							<div
								className={cn(
									"flex flex-shrink-0 items-center justify-center rounded-xl shadow-inner ring-1 ring-black/5",
									"h-9 w-9",
									iconBg,
								)}
							>
								<Icon className="h-4 w-4 text-white" strokeWidth={2} />
							</div>
						)}

						<div className="flex min-w-0 flex-1 flex-col justify-center">
							<p className="mb-1 truncate font-medium text-muted-foreground text-xs leading-tight">
								{title}
							</p>

							<div
								className={cn(
									"mb-0.5 font-bold tabular-nums leading-none tracking-tight",
									"text-xl sm:text-2xl",
									textColor,
								)}
							>
								{typeof value === "string" ? value : value.toLocaleString()}
							</div>

							{changeText && (
								<div className="flex items-center gap-1">
									<p
										className={cn(
											"truncate font-medium text-xs",
											changeType === "positive"
												? "text-emerald-600"
												: changeType === "negative"
													? "text-red-600"
													: changeType === "warning"
														? "text-amber-600"
														: "text-muted-foreground",
										)}
									>
										{changeText}
									</p>
									{showTrend && changeType === "positive" && (
										<TrendingUpIcon className="h-3 w-3 flex-shrink-0 text-emerald-500" />
									)}
									{showTrend && changeType === "negative" && (
										<TrendingDownIcon className="h-3 w-3 flex-shrink-0 text-red-500" />
									)}
								</div>
							)}
						</div>
					</>
				) : (
					<>
						<div className="mb-3 flex items-center gap-3">
							{showIcon && (
								<div
									className={cn(
										"flex flex-shrink-0 items-center justify-center rounded-xl shadow-inner ring-1 ring-black/5",
										"h-9 w-9 sm:h-10 sm:w-10",
										iconBg,
									)}
								>
									<Icon
										className="h-4 w-4 text-white sm:h-5 sm:w-5"
										strokeWidth={2}
									/>
								</div>
							)}
							<p className="truncate font-semibold text-foreground text-sm sm:text-base">
								{title}
							</p>
						</div>

						<div className="mb-3">
							<div
								className={cn(
									"font-bold tabular-nums leading-none tracking-tight",
									"text-2xl sm:text-3xl",
									textColor,
								)}
							>
								{typeof value === "string" ? value : value.toLocaleString()}
							</div>
						</div>

						{changeText && (
							<div className="flex items-center gap-1">
								<p
									className={cn(
										"font-medium text-xs sm:text-sm",
										changeType === "positive"
											? "text-emerald-600"
											: changeType === "negative"
												? "text-red-600"
												: changeType === "warning"
													? "text-amber-600"
													: "text-muted-foreground",
									)}
								>
									{changeText}
								</p>
								{showTrend && changeType === "positive" && (
									<TrendingUpIcon className="h-3 w-3 text-emerald-500 sm:h-4 sm:w-4" />
								)}
								{showTrend && changeType === "negative" && (
									<TrendingDownIcon className="h-3 w-3 text-red-500 sm:h-4 sm:w-4" />
								)}
							</div>
						)}
					</>
				)}

				{showBackgroundIcon && (
					<div
						className={cn(
							"pointer-events-none absolute opacity-[0.07]",
							isCompact ? "top-2 right-2 h-8 w-8" : "top-2 right-2 h-10 w-10",
						)}
					>
						<Icon className="h-full w-full text-foreground" strokeWidth={0.5} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}
