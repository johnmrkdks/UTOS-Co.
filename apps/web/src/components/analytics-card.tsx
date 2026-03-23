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
	bgGradient?: string;
	iconBg?: string;
	textColor?: string;
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

export function AnalyticsCard({
	data,
	className,
	view = "default",
}: AnalyticsCardProps) {
	const {
		title,
		value,
		icon: Icon,
		bgGradient = "bg-gradient-to-br from-gray-50 to-gray-100",
		iconBg = "bg-gray-500",
		textColor = "text-gray-900",
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
				"group relative overflow-hidden border border-gray-200 py-4 shadow-sm",
				bgGradient,
				className,
			)}
		>
			<CardContent
				className={cn(
					isCompact
						? "flex flex-row items-center gap-3 px-4 py-2"
						: "px-4 py-2",
				)}
			>
				{isCompact ? (
					<>
						{/* Icon for Compact */}
						{showIcon && (
							<div
								className={cn(
									"flex flex-shrink-0 items-center justify-center rounded-lg shadow-sm",
									"h-8 w-8",
									iconBg,
								)}
							>
								<Icon className="h-4 w-4 text-white" strokeWidth={2} />
							</div>
						)}

						{/* Content for Compact */}
						<div className="flex min-w-0 flex-1 flex-col justify-center">
							{/* Title */}
							<p className="mb-2 truncate font-semibold text-gray-700 text-sm leading-tight">
								{title}
							</p>

							{/* Value */}
							<div
								className={cn(
									"mb-1 font-bold leading-none",
									"text-xl sm:text-2xl",
									textColor,
								)}
							>
								{typeof value === "string" ? value : value.toLocaleString()}
							</div>

							{/* Change Text */}
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
														: "text-gray-500",
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
						{/* Default View */}
						{/* Icon and Title */}
						<div className="mb-3 flex items-center gap-3">
							{showIcon && (
								<div
									className={cn(
										"flex flex-shrink-0 items-center justify-center rounded-lg shadow-sm",
										"h-8 w-8 sm:h-9 sm:w-9",
										iconBg,
									)}
								>
									<Icon
										className="h-4 w-4 text-white sm:h-5 sm:w-5"
										strokeWidth={2}
									/>
								</div>
							)}
							<p className="truncate font-semibold text-gray-700 text-sm sm:text-base">
								{title}
							</p>
						</div>

						{/* Value Display */}
						<div className="mb-3">
							<div
								className={cn(
									"font-bold leading-none",
									"text-2xl sm:text-3xl",
									textColor,
								)}
							>
								{typeof value === "string" ? value : value.toLocaleString()}
							</div>
						</div>

						{/* Change Text and Trend */}
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
													: "text-gray-500",
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

				{/* Decorative background element */}
				{showBackgroundIcon && (
					<div
						className={cn(
							"absolute opacity-10",
							isCompact ? "top-2 right-2 h-8 w-8" : "top-2 right-2 h-10 w-10",
						)}
					>
						<Icon className="h-full w-full text-gray-600" strokeWidth={0.5} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}
