import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { type LucideIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"

export type AnalyticsCardData = {
	id: string
	title: string
	value: string | number
	icon: LucideIcon
	bgGradient?: string
	iconBg?: string
	textColor?: string
	changeText?: string
	changeType?: "positive" | "negative" | "warning" | "neutral"
	showTrend?: boolean
	showIcon?: boolean
	showBackgroundIcon?: boolean
}

type AnalyticsCardProps = {
	data: AnalyticsCardData
	className?: string
	view?: boolean | "default" | "compact"
}

export function AnalyticsCard({ data, className, view = "default" }: AnalyticsCardProps) {
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
	} = data

	const isCompact = view === true || view === "compact"

	return (
		<Card className={cn("group relative overflow-hidden border shadow-none py-4", bgGradient, className)}>
			<CardContent
				className={cn(
					isCompact ? "flex flex-row items-center gap-3 px-4 py-0" : "p-0",
				)}
			>
				{isCompact ? (
					<>
						{/* Icon for Compact */}
						{showIcon && (
							<div
								className={cn(
									"flex items-center justify-center rounded-lg shadow-sm flex-shrink-0",
									"w-8 h-8",
									iconBg,
								)}
							>
								<Icon
									className="w-4 h-4 text-white"
									strokeWidth={2}
								/>
							</div>
						)}

						{/* Content for Compact */}
						<div className="flex-1 min-w-0 flex flex-col justify-center">
							{/* Title */}
							<p className="font-semibold text-gray-700 truncate leading-tight text-sm mb-1">
								{title}
							</p>

							<div className="flex items-center justify-between gap-2">
								<div
									className={cn(
										"font-bold leading-none",
										"text-2xl",
										textColor,
									)}
								>
									{typeof value === "string" ? value : value.toLocaleString()}
								</div>

								{changeText && (
									<div className="flex items-center gap-1 flex-shrink-0">
										<p
											className={cn(
												"text-xs font-medium truncate",
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
											<TrendingUpIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
										)}
										{showTrend && changeType === "negative" && (
											<TrendingDownIcon className="w-3 h-3 text-red-500 flex-shrink-0" />
										)}
									</div>
								)}
							</div>
						</div>
					</>
				) : (
					<>
						{/* Default View */}
						{/* Icon and Title */}
						<div className="flex items-center gap-3 mb-2">
							{showIcon && (
								<div
									className={cn(
										"flex items-center justify-center rounded-lg shadow-sm flex-shrink-0",
										"w-8 h-8",
										iconBg,
									)}
								>
									<Icon
										className="w-4 h-4 text-white"
										strokeWidth={2}
									/>
								</div>
							)}
							<p className="font-semibold text-gray-700 text-sm">
								{title}
							</p>
						</div>

						{/* Value Display */}
						<div className="mb-2">
							<div
								className={cn(
									"font-bold leading-none",
									"text-2xl",
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
										"text-sm font-medium",
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
									<TrendingUpIcon className="w-4 h-4 text-emerald-500" />
								)}
								{showTrend && changeType === "negative" && (
									<TrendingDownIcon className="w-4 h-4 text-red-500" />
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
							isCompact
								? "top-2 right-2 w-8 h-8"
								: "top-2 right-2 w-10 h-10",
						)}
					>
						<Icon className="w-full h-full text-gray-600" strokeWidth={0.5} />
					</div>
				)}
			</CardContent>
		</Card>
	)
}

