import { AnalyticsCard, type AnalyticsCardData } from '@/components/analytics-card';
import {
	Package,
	CheckCircle,
	XCircle,
	Eye,
	AlertTriangle,
	TrendingUp,
	DollarSign,
	BarChart3,
	ArrowUpRight
} from "lucide-react";

interface PackageAnalyticsCardsProps {
	packages: any[];
	isLoading?: boolean;
}

export function PackageAnalyticsCards({ packages, isLoading }: PackageAnalyticsCardsProps) {
	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-3">
				{[...Array(3)].map((_, index) => (
					<AnalyticsCard 
						key={index}
						data={{
							id: `loading-${index}`,
							title: "Loading...",
							value: "...",
							icon: Package,
							showIcon: false,
							showBackgroundIcon: false
						}}
						view="compact"
						className="animate-pulse"
					/>
				))}
			</div>
		);
	}

	const totalPackages = packages.length;
	const activePackages = packages.filter((pkg: any) => pkg.isAvailable).length;
	const publishedPackages = packages.filter((pkg: any) => pkg.isPublished && pkg.isAvailable).length;
	const unpublishedPackages = packages.filter((pkg: any) => !pkg.isPublished).length;

	const analyticsData: AnalyticsCardData[] = [
		{
			id: "total",
			title: "Total Packages",
			value: totalPackages,
			icon: Package,
			bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
			iconBg: "bg-blue-500",
			textColor: "text-gray-900",
			changeText: "All packages",
			changeType: "neutral",
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: "active",
			title: "Active",
			value: activePackages,
			icon: CheckCircle,
			bgGradient: "bg-gradient-to-br from-emerald-50 to-emerald-100",
			iconBg: "bg-emerald-500",
			textColor: "text-gray-900",
			changeText: totalPackages > 0 ? `${((activePackages / totalPackages) * 100).toFixed(0)}% active` : "No packages",
			changeType: "positive",
			showTrend: true,
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: "published",
			title: "Published",
			value: publishedPackages,
			icon: Eye,
			bgGradient: "bg-gradient-to-br from-purple-50 to-purple-100",
			iconBg: "bg-purple-500",
			textColor: "text-gray-900",
			changeText: totalPackages > 0 ? `${unpublishedPackages} drafts` : "None published",
			changeType: "warning",
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-3">
			{analyticsData.map((data) => (
				<AnalyticsCard 
					key={data.id} 
					data={data} 
					view="compact"
					className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
				/>
			))}
		</div>
	);
}
