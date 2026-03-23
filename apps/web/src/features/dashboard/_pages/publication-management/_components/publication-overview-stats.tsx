import { Badge } from "@workspace/ui/components/badge";
import {
	AlertCircle,
	Car,
	CheckCircle,
	Eye,
	EyeOff,
	Package2,
} from "lucide-react";
import {
	AnalyticsCard,
	type AnalyticsCardData,
} from "@/components/analytics-card";
import { useGetCarsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car/use-get-cars-query";
import { useGetPackagesQuery } from "@/features/dashboard/_pages/packages/_hooks/query/use-get-packages-query";

export function PublicationOverviewStats() {
	const { data: carsData } = useGetCarsQuery({});
	const { data: packagesData } = useGetPackagesQuery({});

	const cars = carsData?.data || [];
	const packages = packagesData?.data || [];

	// Cars stats
	const publishedCars = cars.filter(
		(car) =>
			car.isPublished &&
			car.isActive &&
			car.isAvailable &&
			car.status === "available",
	);
	const unpublishedCars = cars.length - publishedCars.length;
	const readyToPublishCars = cars.filter(
		(car) =>
			!car.isPublished &&
			car.isActive &&
			car.isAvailable &&
			car.status === "available",
	);
	const needsAttentionCars = cars.filter(
		(car) =>
			car.isPublished &&
			(!car.isActive || !car.isAvailable || car.status !== "available"),
	);

	// Packages stats
	const publishedPackages = packages.filter(
		(pkg) => pkg.isPublished && pkg.isAvailable,
	);
	const unpublishedPackages = packages.length - publishedPackages.length;
	const readyToPublishPackages = packages.filter(
		(pkg) => !pkg.isPublished && pkg.isAvailable,
	);
	const needsAttentionPackages = packages.filter(
		(pkg) => pkg.isPublished && !pkg.isAvailable,
	);

	const statsCardsData: AnalyticsCardData[] = [
		{
			id: "published-cars",
			title: "Published Cars",
			value: publishedCars.length,
			icon: Car,
			bgGradient: "bg-gradient-to-br from-green-50 to-green-100",
			iconBg: "bg-green-500",
			changeText: `${cars.length > 0 ? Math.round((publishedCars.length / cars.length) * 100) : 0}% of total`,
			changeType: "positive",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "unpublished-cars",
			title: "Unpublished Cars",
			value: unpublishedCars,
			icon: EyeOff,
			bgGradient: "bg-gradient-to-br from-gray-50 to-gray-100",
			iconBg: "bg-gray-500",
			changeText: "Not visible to customers",
			changeType: "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "published-packages",
			title: "Published Packages",
			value: publishedPackages.length,
			icon: Package2,
			bgGradient: "bg-gradient-to-br from-green-50 to-green-100",
			iconBg: "bg-green-500",
			changeText: `${packages.length > 0 ? Math.round((publishedPackages.length / packages.length) * 100) : 0}% of total`,
			changeType: "positive",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "unpublished-packages",
			title: "Unpublished Packages",
			value: unpublishedPackages,
			icon: EyeOff,
			bgGradient: "bg-gradient-to-br from-gray-50 to-gray-100",
			iconBg: "bg-gray-500",
			changeText: "Not visible to customers",
			changeType: "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
	];

	const actionCardsData: AnalyticsCardData[] = [
		{
			id: "cars-ready-publish",
			title: "Cars Ready to Publish",
			value: readyToPublishCars.length,
			icon: CheckCircle,
			bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
			iconBg: "bg-blue-500",
			changeText: "Meeting all criteria",
			changeType: readyToPublishCars.length > 0 ? "positive" : "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "cars-need-attention",
			title: "Cars Needing Attention",
			value: needsAttentionCars.length,
			icon: AlertCircle,
			bgGradient: "bg-gradient-to-br from-orange-50 to-orange-100",
			iconBg: "bg-orange-500",
			changeText: "Published with issues",
			changeType: needsAttentionCars.length > 0 ? "warning" : "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "packages-ready-publish",
			title: "Packages Ready to Publish",
			value: readyToPublishPackages.length,
			icon: CheckCircle,
			bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
			iconBg: "bg-blue-500",
			changeText: "Ready for publication",
			changeType: readyToPublishPackages.length > 0 ? "positive" : "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "packages-need-attention",
			title: "Packages Needing Attention",
			value: needsAttentionPackages.length,
			icon: AlertCircle,
			bgGradient: "bg-gradient-to-br from-orange-50 to-orange-100",
			iconBg: "bg-orange-500",
			changeText: "Published but unavailable",
			changeType: needsAttentionPackages.length > 0 ? "warning" : "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-4 font-semibold text-xl">Publication Overview</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{statsCardsData.map((data) => (
						<AnalyticsCard key={data.id} data={data} view="compact" />
					))}
				</div>
			</div>

			<div>
				<h2 className="mb-4 font-semibold text-xl">Action Required</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{actionCardsData.map((data) => (
						<div key={data.id} className="relative">
							<AnalyticsCard data={data} view="compact" />
							{data.value > 0 && (
								<Badge
									variant="secondary"
									className="-top-2 -right-2 absolute text-xs"
								>
									Requires Review
								</Badge>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
