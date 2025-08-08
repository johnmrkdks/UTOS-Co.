import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { 
	TrendingUp, 
	Brain, 
	Calendar, 
	MapPin, 
	Clock, 
	AlertTriangle,
	Target,
	Zap
} from "lucide-react";

interface PredictiveAnalyticsProps {
	dateRange: string;
}

export function PredictiveAnalytics({ dateRange }: PredictiveAnalyticsProps) {
	// Mock predictive data - in real implementation, this would come from ML models
	const predictiveData = {
		demandForecast: {
			nextWeek: {
				expectedBookings: 85,
				confidence: 87,
				peakDays: ["Friday", "Saturday"],
				peakHours: ["18:00-20:00", "22:00-24:00"],
			},
			nextMonth: {
				expectedRevenue: 52000,
				confidence: 82,
				growth: "+13.7%",
			},
		},
		hotspots: [
			{ location: "Sydney Airport", predictedDemand: 95, increase: "+23%" },
			{ location: "CBD Downtown", predictedDemand: 82, increase: "+15%" },
			{ location: "Circular Quay", predictedDemand: 74, increase: "+8%" },
			{ location: "Darling Harbour", predictedDemand: 68, increase: "+12%" },
		],
		seasonalTrends: {
			currentSeason: "Summer Peak",
			impact: "+18%",
			recommendation: "Increase driver availability during evening hours",
		},
		churnRisk: {
			highRisk: 3,
			mediumRisk: 7,
			totalCustomers: 1247,
			retentionRate: 94.2,
		},
		optimizations: [
			{
				type: "pricing",
				recommendation: "Increase peak hour rates by 15% during Friday evenings",
				expectedImpact: "+$2,400 monthly revenue",
				confidence: 91,
			},
			{
				type: "fleet",
				recommendation: "Deploy 2 additional drivers near Sydney Airport during 6-8 PM",
				expectedImpact: "24% reduction in wait times",
				confidence: 88,
			},
			{
				type: "marketing",
				recommendation: "Target corporate clients with package deals for recurring bookings",
				expectedImpact: "+15% package booking conversion",
				confidence: 85,
			},
		],
	};

	return (
		<div className="grid gap-4">
			<Alert>
				<Brain className="h-4 w-4" />
				<AlertDescription>
					Predictive insights are generated using machine learning models trained on historical data. 
					Confidence levels indicate model accuracy.
				</AlertDescription>
			</Alert>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5 text-blue-600" />
							Demand Forecast
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-medium">Next Week Bookings</span>
								<Badge variant="outline">
									{predictiveData.demandForecast.nextWeek.confidence}% confidence
								</Badge>
							</div>
							<div className="text-2xl font-bold mb-2">
								{predictiveData.demandForecast.nextWeek.expectedBookings} bookings
							</div>
							<Progress 
								value={predictiveData.demandForecast.nextWeek.confidence} 
								className="h-2" 
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm">
								<Clock className="h-4 w-4 text-orange-500" />
								<span className="font-medium">Peak Times:</span>
								{predictiveData.demandForecast.nextWeek.peakHours.map((time, index) => (
									<Badge key={index} variant="secondary" className="text-xs">
										{time}
									</Badge>
								))}
							</div>
							<div className="flex items-center gap-2 text-sm">
								<Calendar className="h-4 w-4 text-green-500" />
								<span className="font-medium">Peak Days:</span>
								{predictiveData.demandForecast.nextWeek.peakDays.map((day, index) => (
									<Badge key={index} variant="secondary" className="text-xs">
										{day}
									</Badge>
								))}
							</div>
						</div>

						<div className="pt-3 border-t">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Next Month Revenue</span>
								<span className="text-lg font-bold text-green-600">
									${predictiveData.demandForecast.nextMonth.expectedRevenue.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between items-center text-sm text-muted-foreground">
								<span>Projected growth</span>
								<span className="text-green-600 font-medium">
									{predictiveData.demandForecast.nextMonth.growth}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="h-5 w-5 text-red-600" />
							Demand Hotspots
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{predictiveData.hotspots.map((hotspot, index) => (
								<div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
									<div>
										<p className="text-sm font-medium">{hotspot.location}</p>
										<div className="flex items-center gap-2">
											<Progress 
												value={hotspot.predictedDemand} 
												className="h-1 w-16" 
											/>
											<span className="text-xs text-muted-foreground">
												{hotspot.predictedDemand}% demand
											</span>
										</div>
									</div>
									<Badge 
										variant="outline" 
										className="bg-green-50 text-green-700 border-green-200"
									>
										{hotspot.increase}
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5 text-purple-600" />
						AI Recommendations
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-1">
						{predictiveData.optimizations.map((optimization, index) => (
							<div key={index} className="p-4 rounded-lg border bg-card">
								<div className="flex justify-between items-start mb-2">
									<div className="flex items-center gap-2">
										<Zap className="h-4 w-4 text-yellow-500" />
										<span className="text-sm font-medium capitalize">
											{optimization.type} Optimization
										</span>
									</div>
									<Badge variant="outline">
										{optimization.confidence}% confidence
									</Badge>
								</div>
								
								<p className="text-sm mb-2">{optimization.recommendation}</p>
								
								<div className="flex justify-between items-center text-sm">
									<span className="text-muted-foreground">Expected Impact:</span>
									<span className="font-medium text-green-600">
										{optimization.expectedImpact}
									</span>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-green-600" />
							Seasonal Analysis
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Current Season:</span>
								<Badge variant="default">
									{predictiveData.seasonalTrends.currentSeason}
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Impact on Demand:</span>
								<span className="text-sm font-bold text-green-600">
									{predictiveData.seasonalTrends.impact}
								</span>
							</div>
							<Alert className="bg-blue-50 border-blue-200">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription className="text-sm">
									<strong>Recommendation:</strong> {predictiveData.seasonalTrends.recommendation}
								</AlertDescription>
							</Alert>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-orange-600" />
							Customer Retention
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-sm font-medium">Overall Retention Rate:</span>
							<span className="text-lg font-bold text-green-600">
								{predictiveData.churnRisk.retentionRate}%
							</span>
						</div>
						
						<div className="space-y-2">
							<div className="flex justify-between items-center text-sm">
								<span>High Churn Risk:</span>
								<Badge variant="destructive">{predictiveData.churnRisk.highRisk} customers</Badge>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span>Medium Churn Risk:</span>
								<Badge variant="secondary">{predictiveData.churnRisk.mediumRisk} customers</Badge>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span>Total Customers:</span>
								<span className="font-medium">{predictiveData.churnRisk.totalCustomers}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}