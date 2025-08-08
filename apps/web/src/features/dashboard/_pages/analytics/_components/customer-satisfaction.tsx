import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Star, ThumbsUp, MessageCircle, TrendingUp, Users, Heart } from "lucide-react";

interface CustomerSatisfactionProps {
	dateRange: string;
}

export function CustomerSatisfaction({ dateRange }: CustomerSatisfactionProps) {
	const satisfactionData = {
		overallRating: 4.7,
		totalReviews: 1247,
		responseRate: 78.5,
		ratingDistribution: {
			5: { count: 687, percentage: 55.1 },
			4: { count: 374, percentage: 30.0 },
			3: { count: 124, percentage: 9.9 },
			2: { count: 43, percentage: 3.4 },
			1: { count: 19, percentage: 1.5 },
		},
		categories: {
			driverProfessionalism: 4.8,
			vehicleCondition: 4.6,
			punctuality: 4.5,
			routeEfficiency: 4.4,
			communication: 4.7,
			overallExperience: 4.7,
		},
		recentReviews: [
			{
				id: "1",
				customer: "Sarah M.",
				rating: 5,
				comment: "Excellent service! Driver was on time and very professional. Clean vehicle and smooth ride.",
				date: "2 hours ago",
				trip: "Airport → CBD"
			},
			{
				id: "2",
				customer: "John D.",
				rating: 4,
				comment: "Good service overall. Driver was friendly but took a slightly longer route than expected.",
				date: "5 hours ago",
				trip: "North Shore → City"
			},
			{
				id: "3",
				customer: "Emma K.",
				rating: 5,
				comment: "Amazing experience! The driver helped with my luggage and was very courteous throughout.",
				date: "1 day ago",
				trip: "Home → Airport"
			},
			{
				id: "4",
				customer: "Michael R.",
				rating: 4,
				comment: "Reliable service as always. Comfortable car and punctual pickup.",
				date: "1 day ago",
				trip: "Hotel → Conference Center"
			},
			{
				id: "5",
				customer: "Lisa W.",
				rating: 5,
				comment: "Perfect service for our corporate event. Driver was professional and the vehicle was immaculate.",
				date: "2 days ago",
				trip: "Office → Event Venue"
			},
		],
		trends: {
			monthlyChange: +0.3,
			satisfactionTrend: "increasing",
			topCompliments: [
				{ category: "Professional Driver", count: 234 },
				{ category: "Clean Vehicle", count: 187 },
				{ category: "On Time", count: 156 },
				{ category: "Smooth Ride", count: 143 },
				{ category: "Helpful Service", count: 128 },
			],
			commonIssues: [
				{ category: "Route Choice", count: 12 },
				{ category: "Communication", count: 8 },
				{ category: "Vehicle Condition", count: 5 },
			],
		},
	};

	const renderStars = (rating: number) => {
		const stars = [];
		for (let i = 1; i <= 5; i++) {
			stars.push(
				<Star
					key={i}
					className={`h-3 w-3 ${
						i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
					}`}
				/>
			);
		}
		return stars;
	};

	return (
		<div className="grid gap-4">
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Star className="h-4 w-4 text-yellow-600" />
							Overall Rating
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{satisfactionData.overallRating}</div>
						<div className="flex items-center gap-1 mb-2">
							{renderStars(Math.round(satisfactionData.overallRating))}
						</div>
						<div className="text-xs text-muted-foreground">
							Based on {satisfactionData.totalReviews.toLocaleString()} reviews
						</div>
						<div className="flex items-center gap-1 mt-2">
							<TrendingUp className="h-3 w-3 text-green-500" />
							<span className="text-xs text-green-600 font-medium">
								+{satisfactionData.trends.monthlyChange} this month
							</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<MessageCircle className="h-4 w-4 text-blue-600" />
							Response Rate
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{satisfactionData.responseRate}%</div>
						<div className="text-xs text-muted-foreground mb-2">
							Customer feedback rate
						</div>
						<Progress value={satisfactionData.responseRate} className="h-1" />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<ThumbsUp className="h-4 w-4 text-green-600" />
							Satisfaction Trend
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">Excellent</div>
						<div className="text-xs text-muted-foreground mb-2">
							{satisfactionData.trends.satisfactionTrend}
						</div>
						<Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
							Above Industry Average
						</Badge>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Star className="h-5 w-5 text-yellow-600" />
							Rating Distribution
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{Object.entries(satisfactionData.ratingDistribution)
							.reverse()
							.map(([rating, data]) => (
								<div key={rating}>
									<div className="flex justify-between items-center mb-1">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium">{rating}</span>
											<div className="flex">
												{renderStars(parseInt(rating))}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-sm font-bold">{data.count}</span>
											<Badge variant="outline" className="text-xs">
												{data.percentage}%
											</Badge>
										</div>
									</div>
									<Progress value={data.percentage} className="h-2" />
								</div>
							))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Heart className="h-5 w-5 text-red-600" />
							Service Categories
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{Object.entries(satisfactionData.categories).map(([category, rating]) => (
							<div key={category}>
								<div className="flex justify-between items-center mb-1">
									<span className="text-sm font-medium capitalize">
										{category.replace(/([A-Z])/g, ' $1').trim()}
									</span>
									<div className="flex items-center gap-1">
										<span className="text-sm font-bold">{rating}</span>
										<Star className="h-3 w-3 text-yellow-400 fill-current" />
									</div>
								</div>
								<Progress value={rating * 20} className="h-1" />
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ThumbsUp className="h-5 w-5 text-green-600" />
							Top Compliments
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{satisfactionData.trends.topCompliments.map((compliment, index) => (
								<div key={index} className="flex justify-between items-center p-2 rounded-lg bg-green-50">
									<span className="text-sm font-medium">{compliment.category}</span>
									<Badge variant="outline" className="bg-green-100 text-green-800">
										{compliment.count}
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MessageCircle className="h-5 w-5 text-blue-600" />
							Recent Reviews
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ScrollArea className="h-[280px] pr-2">
							<div className="space-y-3">
								{satisfactionData.recentReviews.map((review) => (
									<div key={review.id} className="p-3 rounded-lg border bg-card">
										<div className="flex justify-between items-start mb-2">
											<div>
												<p className="text-sm font-medium">{review.customer}</p>
												<div className="flex items-center gap-1">
													{renderStars(review.rating)}
													<span className="text-xs text-muted-foreground ml-1">
														{review.date}
													</span>
												</div>
											</div>
											<Badge variant="outline" className="text-xs">
												{review.trip}
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground">
											"{review.comment}"
										</p>
									</div>
								))}
							</div>
						</ScrollArea>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}