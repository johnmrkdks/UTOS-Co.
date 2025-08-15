import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
	FolderOpen,
	Package,
	BarChart3,
	Hash,
	TrendingUp,
	Activity,
	ArrowUpRight
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface CategoryAnalyticsCardsProps {
	categories: any[];
	packages: any[];
	isLoading?: boolean;
}

export function CategoryAnalyticsCards({ categories, packages, isLoading }: CategoryAnalyticsCardsProps) {
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

	const totalCategories = categories.length;
	const categoriesWithPackages = categories.filter((cat: any) =>
		packages.some((pkg: any) => pkg.categoryId === cat.id)
	).length;
	const averagePackagesPerCategory = totalCategories > 0
		? packages.length / totalCategories
		: 0;

	const analyticsData = [
		{
			id: "total-categories",
			title: "Total Categories",
			value: totalCategories,
			icon: FolderOpen,
			bgGradient: "bg-gradient-to-br from-indigo-50 to-indigo-100",
			iconBg: "bg-indigo-500",
			textColor: "text-gray-900",
			changeText: "Package categories",
			changeType: "neutral" as const,
		},
		{
			id: "active-categories",
			title: "With Packages",
			value: categoriesWithPackages,
			icon: Package,
			bgGradient: "bg-gradient-to-br from-emerald-50 to-emerald-100",
			iconBg: "bg-emerald-500",
			textColor: "text-gray-900",
			changeText: totalCategories > 0 ? `${((categoriesWithPackages / totalCategories) * 100).toFixed(0)}% utilized` : "No categories",
			changeType: "positive" as const,
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-3">
			{analyticsData.map((item) => (
				<Card key={item.id} className={cn("group relative overflow-hidden border", item.bgGradient)}>
					<CardContent className="px-4 py-0">
						{/* Header with icon and trend */}
						<div className="flex flex-row gap-4">
							<div className="flex items-center justify-between">
								<div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shadow-md", item.iconBg)}>
									<item.icon className="w-4 h-4 text-white" strokeWidth={2} />
								</div>
							</div>

							<div className="flex flex-row gap-2">
								{/* Value */}
								<div className="mb-2">
									<div className={cn("text-3xl font-bold leading-none", item.textColor)}>
										{typeof item.value === 'string' ? item.value : item.value.toLocaleString()}
									</div>
								</div>

								{/* Title and change text */}
								<div className="space-y-1">
									<p className="text-sm font-semibold text-gray-700">
										{item.title}
									</p>
									<div className="flex items-center justify-between">
										<p className={cn("text-xs font-medium", item.changeType === 'positive' ? 'text-emerald-600' :
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
						</div>

						{/* Decorative element */}
						<div className="absolute top-0 right-0 w-16 h-16 opacity-10">
							<item.icon className="w-full h-full text-gray-600" strokeWidth={0.5} />
						</div>
					</CardContent>
				</Card>
			))
			}
		</div >
	);
}
