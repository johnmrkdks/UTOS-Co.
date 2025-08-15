import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
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
import { cn } from "@workspace/ui/lib/utils";

interface PackageAnalyticsCardsProps {
	packages: any[];
	isLoading?: boolean;
}

export function PackageAnalyticsCards({ packages, isLoading }: PackageAnalyticsCardsProps) {
	if (isLoading) {
		return (
			<div className="grid gap-6 md:grid-cols-3">
				{[...Array(3)].map((_, index) => (
					<Card key={index} className="animate-pulse bg-white border-0 shadow-md">
						<CardContent className="p-4">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
									<div className="h-3 bg-gray-200 rounded-full w-12"></div>
								</div>
								<div className="space-y-2">
									<div className="h-6 bg-gray-200 rounded w-12"></div>
									<div className="h-3 bg-gray-200 rounded w-20"></div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	const totalPackages = packages.length;
	const activePackages = packages.filter((pkg: any) => pkg.isAvailable).length;
	const publishedPackages = packages.filter((pkg: any) => pkg.isPublished && pkg.isAvailable).length;
	const unpublishedPackages = packages.filter((pkg: any) => !pkg.isPublished).length;
	const averagePrice = packages.length > 0
		? packages.reduce((sum: number, pkg: any) => sum + (pkg.fixedPrice || 0), 0) / packages.length / 100
		: 0;

	const analyticsData = [
		{
			id: "total",
			title: "Total Packages",
			value: totalPackages,
			icon: Package,
			bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
			iconBg: "bg-blue-500",
			textColor: "text-gray-900",
			changeText: "All packages",
			changeType: "neutral" as const,
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
			changeType: "positive" as const,
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
			changeType: "warning" as const,
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-3">
			{analyticsData.map((item) => (
				<Card key={item.id} className={cn("group relative overflow-hidden border shadow-none", item.bgGradient)}>
					<CardContent className="flex flex-row gap-4 px-4 py-0">
						{/* Header with icon and trend */}
						<div className="flex items-center justify-between">
							<div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shadow-md", item.iconBg)}>
								<item.icon className="w-4 h-4 text-white" strokeWidth={2} />
							</div>
						</div>

						{/* Value */}
						<div className="flex flex-row gap-2">
							<div className={cn("text-3xl font-bold leading-none", item.textColor)}>
								{typeof item.value === 'string' ? item.value : item.value.toLocaleString()}
							</div>

							{/* Title and change text */}
							<div className="space-y-1">
								<p className="text-sm font-semibold text-gray-700">
									{item.title}
								</p>
								<div className="flex items-center justify-between">
									<p className={cn("text-xs font-medium",
										item.changeType === 'positive' ? 'text-emerald-600' :
											item.changeType === 'warning' ? 'text-amber-600' :
												'text-gray-500'
									)}>
										{item.changeText}
									</p>
									{item.changeType === 'positive' && (
										<TrendingUp className="w-3 h-3 text-emerald-500" />
									)}
								</div>
							</div>
						</div>

						{/* Decorative element */}
						<div className="absolute top-0 right-0 w-16 h-16 opacity-10">
							<item.icon className="w-full h-full text-gray-600" strokeWidth={0.5} />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
