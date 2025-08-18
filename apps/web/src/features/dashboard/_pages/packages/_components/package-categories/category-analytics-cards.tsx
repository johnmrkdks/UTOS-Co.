import { AnalyticsCard, type AnalyticsCardData } from '@/components/analytics-card';
import {
	FolderOpen,
	Package,
	BarChart3,
	Hash,
	TrendingUp,
	Activity,
	ArrowUpRight
} from "lucide-react";

interface CategoryAnalyticsCardsProps {
	categories: any[];
	packages: any[];
	isLoading?: boolean;
}

export function CategoryAnalyticsCards({ categories, packages, isLoading }: CategoryAnalyticsCardsProps) {
	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-3">
				{[...Array(2)].map((_, index) => (
					<AnalyticsCard 
						key={index}
						data={{
							id: `loading-${index}`,
							title: "Loading...",
							value: "...",
							icon: FolderOpen,
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

	const totalCategories = categories.length;
	const categoriesWithPackages = categories.filter((cat: any) =>
		packages.some((pkg: any) => pkg.categoryId === cat.id)
	).length;

	const analyticsData: AnalyticsCardData[] = [
		{
			id: "total-categories",
			title: "Total Categories",
			value: totalCategories,
			icon: FolderOpen,
			bgGradient: "bg-gradient-to-br from-indigo-50 to-indigo-100",
			iconBg: "bg-indigo-500",
			textColor: "text-gray-900",
			changeText: "Package categories",
			changeType: "neutral",
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true
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
			changeType: "positive",
			showTrend: true,
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
				/>
			))}
		</div>
	);
}