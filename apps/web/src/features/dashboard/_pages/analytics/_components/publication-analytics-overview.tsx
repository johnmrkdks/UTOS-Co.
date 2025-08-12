import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { 
	BarChart, 
	Bar, 
	XAxis, 
	YAxis, 
	CartesianGrid, 
	Tooltip, 
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell 
} from "recharts";
import { 
	Eye, 
	EyeOff, 
	AlertTriangle, 
	TrendingUp, 
	TrendingDown, 
	Minus,
	Car,
	Package 
} from "lucide-react";

export interface PublicationAnalyticsData {
	cars: {
		total: number;
		published: number;
		unpublished: number;
		publishedWithIssues: number;
		lastWeekPublished: number;
		categories: Array<{
			name: string;
			total: number;
			published: number;
		}>;
	};
	packages: {
		total: number;
		published: number;
		unpublished: number;
		publishedWithIssues: number;
		lastWeekPublished: number;
		categories: Array<{
			name: string;
			total: number;
			published: number;
		}>;
	};
	publicationTrends: Array<{
		date: string;
		carsPublished: number;
		packagesPublished: number;
	}>;
}

export interface PublicationAnalyticsOverviewProps {
	data: PublicationAnalyticsData;
	isLoading?: boolean;
}

const COLORS = {
	published: "#22c55e",
	unpublished: "#6b7280",
	withIssues: "#f59e0b",
};

export function PublicationAnalyticsOverview({ 
	data, 
	isLoading = false 
}: PublicationAnalyticsOverviewProps) {
	const analyticsData = useMemo(() => {
		const carsPublishRate = data.cars.total > 0 
			? Math.round((data.cars.published / data.cars.total) * 100) 
			: 0;
		const packagesPublishRate = data.packages.total > 0 
			? Math.round((data.packages.published / data.packages.total) * 100) 
			: 0;

		// Calculate trends
		const carsTrend = data.cars.lastWeekPublished - data.cars.published;
		const packagesTrend = data.packages.lastWeekPublished - data.packages.published;

		// Prepare chart data
		const overviewData = [
			{
				name: "Cars",
				published: data.cars.published,
				unpublished: data.cars.unpublished,
				withIssues: data.cars.publishedWithIssues,
				total: data.cars.total,
			},
			{
				name: "Packages",
				published: data.packages.published,
				unpublished: data.packages.unpublished,
				withIssues: data.packages.publishedWithIssues,
				total: data.packages.total,
			},
		];

		const pieData = [
			{ name: "Published Cars", value: data.cars.published, color: COLORS.published },
			{ name: "Published Packages", value: data.packages.published, color: "#3b82f6" },
			{ name: "Unpublished Cars", value: data.cars.unpublished, color: COLORS.unpublished },
			{ name: "Unpublished Packages", value: data.packages.unpublished, color: "#94a3b8" },
		];

		return {
			carsPublishRate,
			packagesPublishRate,
			carsTrend,
			packagesTrend,
			overviewData,
			pieData,
		};
	}, [data]);

	if (isLoading) {
		return <div className="space-y-6">Loading analytics...</div>;
	}

	const getTrendIcon = (trend: number) => {
		if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
		if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
		return <Minus className="h-4 w-4 text-gray-500" />;
	};

	const getTrendLabel = (trend: number) => {
		if (trend > 0) return `+${trend} this week`;
		if (trend < 0) return `${trend} this week`;
		return "No change";
	};

	return (
		<div className="space-y-6">
			{/* Key Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Cars Published</CardTitle>
						<Car className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{data.cars.published}
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							{getTrendIcon(analyticsData.carsTrend)}
							{getTrendLabel(analyticsData.carsTrend)}
						</div>
						<Progress value={analyticsData.carsPublishRate} className="mt-2 h-2" />
						<p className="text-xs text-muted-foreground mt-1">
							{analyticsData.carsPublishRate}% of total cars
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Packages Published</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">
							{data.packages.published}
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							{getTrendIcon(analyticsData.packagesTrend)}
							{getTrendLabel(analyticsData.packagesTrend)}
						</div>
						<Progress value={analyticsData.packagesPublishRate} className="mt-2 h-2" />
						<p className="text-xs text-muted-foreground mt-1">
							{analyticsData.packagesPublishRate}% of total packages
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Items with Issues</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-amber-600">
							{data.cars.publishedWithIssues + data.packages.publishedWithIssues}
						</div>
						<div className="flex items-center gap-1 mt-2">
							<Badge variant="destructive" className="text-xs">
								{data.cars.publishedWithIssues} Cars
							</Badge>
							<Badge variant="destructive" className="text-xs">
								{data.packages.publishedWithIssues} Packages
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Overall Rate</CardTitle>
						<Eye className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{Math.round(((data.cars.published + data.packages.published) / 
							             (data.cars.total + data.packages.total)) * 100)}%
						</div>
						<p className="text-xs text-muted-foreground mt-2">
							{data.cars.published + data.packages.published} of{" "}
							{data.cars.total + data.packages.total} items published
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Publication Status Chart */}
				<Card>
					<CardHeader>
						<CardTitle>Publication Status Overview</CardTitle>
						<CardDescription>
							Current publication status by content type
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={analyticsData.overviewData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="published" fill={COLORS.published} name="Published" />
								<Bar dataKey="withIssues" fill={COLORS.withIssues} name="With Issues" />
								<Bar dataKey="unpublished" fill={COLORS.unpublished} name="Unpublished" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Distribution Pie Chart */}
				<Card>
					<CardHeader>
						<CardTitle>Content Distribution</CardTitle>
						<CardDescription>
							Published vs unpublished content breakdown
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={analyticsData.pieData}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
								>
									{analyticsData.pieData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Category Breakdown */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Cars by Category</CardTitle>
						<CardDescription>Publication status by car category</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{data.cars.categories.map((category) => {
								const publishRate = category.total > 0 
									? Math.round((category.published / category.total) * 100)
									: 0;
								
								return (
									<div key={category.name} className="space-y-2">
										<div className="flex justify-between text-sm">
											<span className="font-medium">{category.name}</span>
											<span className="text-muted-foreground">
												{category.published}/{category.total}
											</span>
										</div>
										<Progress value={publishRate} className="h-2" />
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Packages by Category</CardTitle>
						<CardDescription>Publication status by package category</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{data.packages.categories.map((category) => {
								const publishRate = category.total > 0 
									? Math.round((category.published / category.total) * 100)
									: 0;
								
								return (
									<div key={category.name} className="space-y-2">
										<div className="flex justify-between text-sm">
											<span className="font-medium">{category.name}</span>
											<span className="text-muted-foreground">
												{category.published}/{category.total}
											</span>
										</div>
										<Progress value={publishRate} className="h-2" />
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}