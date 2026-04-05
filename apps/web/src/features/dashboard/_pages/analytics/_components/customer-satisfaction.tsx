import { Badge } from "@workspace/ui/components/badge";
import {
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { MessageCircle, Star, TrendingUp } from "lucide-react";
import { DashboardChartCard } from "@/features/dashboard/_components/dashboard-chart-card";

interface ReviewsData {
	totalReviews: number;
	averageRating: number;
	ratingDistribution: Record<number, number>;
	recentReviews: Array<{
		id: string;
		bookingId: string | null;
		serviceRating: number;
		driverRating: number;
		vehicleRating: number;
		review: string | null;
		createdAt: Date;
	}>;
}

interface CustomerSatisfactionProps {
	dateRange: string;
	analytics?: ReviewsData | null;
}

function formatTimeAgo(date: Date): string {
	const now = new Date();
	const diffInMinutes = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60),
	);
	if (diffInMinutes < 1) return "Just now";
	if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) return `${diffInHours}h ago`;
	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) return `${diffInDays}d ago`;
	return date.toLocaleDateString();
}

export function CustomerSatisfaction({
	dateRange,
	analytics,
}: CustomerSatisfactionProps) {
	const totalReviews = analytics?.totalReviews ?? 0;
	const averageRating = analytics?.averageRating ?? 0;
	const ratingDistribution = analytics?.ratingDistribution ?? {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
	};
	const recentReviews = analytics?.recentReviews ?? [];

	const renderStars = (rating: number) => {
		const stars = [];
		for (let i = 1; i <= 5; i++) {
			stars.push(
				<Star
					key={i}
					className={`h-3 w-3 ${
						i <= rating ? "fill-current text-yellow-400" : "text-gray-300"
					}`}
				/>,
			);
		}
		return stars;
	};

	// Build distribution with percentages for display
	const distEntries = [5, 4, 3, 2, 1].map((r) => ({
		rating: r,
		count: ratingDistribution[r] ?? 0,
		percentage:
			totalReviews > 0
				? ((ratingDistribution[r] ?? 0) / totalReviews) * 100
				: 0,
	}));

	return (
		<div className="grid gap-4">
			<div className="grid gap-4 md:grid-cols-3">
				<DashboardChartCard>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<Star className="h-4 w-4 text-yellow-600" />
							Overall Rating
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-3xl">{averageRating.toFixed(1)}</div>
						<div className="mb-2 flex items-center gap-1">
							{renderStars(Math.round(averageRating))}
						</div>
						<div className="text-muted-foreground text-xs">
							Based on {totalReviews.toLocaleString()} reviews
						</div>
						{totalReviews > 0 && (
							<div className="mt-2 flex items-center gap-1">
								<TrendingUp className="h-3 w-3 text-green-500" />
								<span className="font-medium text-green-600 text-xs">
									Live data from booking reviews
								</span>
							</div>
						)}
					</CardContent>
				</DashboardChartCard>

				<DashboardChartCard>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<MessageCircle className="h-4 w-4 text-blue-600" />
							Review Coverage
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{totalReviews}</div>
						<div className="mb-2 text-muted-foreground text-xs">
							Total reviews submitted
						</div>
					</CardContent>
				</DashboardChartCard>

				<DashboardChartCard>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<Star className="h-4 w-4 text-yellow-600" />
							Satisfaction
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{totalReviews === 0
								? "—"
								: averageRating >= 4
									? "Good"
									: averageRating >= 3
										? "Fair"
										: "Needs improvement"}
						</div>
						<div className="mb-2 text-muted-foreground text-xs">
							{totalReviews === 0
								? "No reviews yet"
								: "Based on average rating"}
						</div>
					</CardContent>
				</DashboardChartCard>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<DashboardChartCard>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Star className="h-5 w-5 text-yellow-600" />
							Rating Distribution
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{totalReviews === 0 ? (
							<p className="text-muted-foreground text-sm">
								No reviews yet. Ratings will appear here once customers submit
								feedback.
							</p>
						) : (
							distEntries.map(({ rating, count, percentage }) => (
								<div key={rating}>
									<div className="mb-1 flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="font-medium text-sm">{rating}</span>
											<div className="flex">{renderStars(rating)}</div>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-bold text-sm">{count}</span>
											<Badge variant="outline" className="text-xs">
												{percentage.toFixed(1)}%
											</Badge>
										</div>
									</div>
									<Progress value={percentage} className="h-2" />
								</div>
							))
						)}
					</CardContent>
				</DashboardChartCard>

				<DashboardChartCard>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MessageCircle className="h-5 w-5 text-blue-600" />
							Recent Reviews
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ScrollArea className="h-[280px] pr-2">
							<div className="space-y-3">
								{recentReviews.length === 0 ? (
									<p className="text-muted-foreground text-sm">
										No reviews yet.
									</p>
								) : (
									recentReviews.map((r) => {
										const avgRating =
											(r.serviceRating + r.driverRating + r.vehicleRating) / 3;
										return (
											<div key={r.id} className="rounded-lg border bg-card p-3">
												<div className="mb-2 flex items-start justify-between">
													<div>
														<p className="font-medium text-sm">
															Booking {r.bookingId ?? "—"}
														</p>
														<div className="flex items-center gap-1">
															{renderStars(Math.round(avgRating))}
															<span className="ml-1 text-muted-foreground text-xs">
																{formatTimeAgo(new Date(r.createdAt))}
															</span>
														</div>
													</div>
													<Badge variant="outline" className="text-xs">
														Service {r.serviceRating} · Driver {r.driverRating}{" "}
														· Vehicle {r.vehicleRating}
													</Badge>
												</div>
												{r.review && (
													<p className="text-muted-foreground text-xs">
														"{r.review}"
													</p>
												)}
											</div>
										);
									})
								)}
							</div>
						</ScrollArea>
					</CardContent>
				</DashboardChartCard>
			</div>
		</div>
	);
}
