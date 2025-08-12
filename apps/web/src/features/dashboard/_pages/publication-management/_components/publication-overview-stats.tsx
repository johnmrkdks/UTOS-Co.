import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Car, Package2, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";

import { useGetPackagesQuery } from "@/features/dashboard/_pages/packages/_hooks/query/use-get-packages-query";
import { useGetCarsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car/use-get-cars-query";

export function PublicationOverviewStats() {
	const { data: carsData } = useGetCarsQuery({});
	const { data: packagesData } = useGetPackagesQuery({});

	const cars = carsData?.data || [];
	const packages = packagesData?.data || [];

	// Cars stats
	const publishedCars = cars.filter(car => car.isPublished && car.isActive && car.isAvailable && car.status === 'available');
	const unpublishedCars = cars.length - publishedCars.length;
	const readyToPublishCars = cars.filter(car =>
		!car.isPublished && car.isActive && car.isAvailable && car.status === 'available'
	);
	const needsAttentionCars = cars.filter(car =>
		car.isPublished && (!car.isActive || !car.isAvailable || car.status !== 'available')
	);

	// Packages stats
	const publishedPackages = packages.filter(pkg => pkg.isPublished && pkg.isAvailable);
	const unpublishedPackages = packages.length - publishedPackages.length;
	const readyToPublishPackages = packages.filter(pkg => !pkg.isPublished && pkg.isAvailable);
	const needsAttentionPackages = packages.filter(pkg => pkg.isPublished && !pkg.isAvailable);

	const statsCards = [
		{
			title: "Published Cars",
			value: publishedCars.length,
			total: cars.length,
			icon: Car,
			color: "text-green-600",
			bgColor: "bg-green-50",
			description: "Publicly visible cars"
		},
		{
			title: "Unpublished Cars",
			value: unpublishedCars,
			total: cars.length,
			icon: EyeOff,
			color: "text-gray-600",
			bgColor: "bg-gray-50",
			description: "Not visible to customers"
		},
		{
			title: "Published Packages",
			value: publishedPackages.length,
			total: packages.length,
			icon: Package2,
			color: "text-green-600",
			bgColor: "bg-green-50",
			description: "Publicly visible packages"
		},
		{
			title: "Unpublished Packages",
			value: unpublishedPackages,
			total: packages.length,
			icon: EyeOff,
			color: "text-gray-600",
			bgColor: "bg-gray-50",
			description: "Not visible to customers"
		},
	];

	const actionCards = [
		{
			title: "Cars Ready to Publish",
			value: readyToPublishCars.length,
			icon: CheckCircle,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
			description: "Cars meeting all publication criteria"
		},
		{
			title: "Cars Needing Attention",
			value: needsAttentionCars.length,
			icon: AlertCircle,
			color: "text-orange-600",
			bgColor: "bg-orange-50",
			description: "Published cars with issues"
		},
		{
			title: "Packages Ready to Publish",
			value: readyToPublishPackages.length,
			icon: CheckCircle,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
			description: "Packages ready for publication"
		},
		{
			title: "Packages Needing Attention",
			value: needsAttentionPackages.length,
			icon: AlertCircle,
			color: "text-orange-600",
			bgColor: "bg-orange-50",
			description: "Published packages that are unavailable"
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold mb-4">Publication Overview</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{statsCards.map((stat) => (
						<Card key={stat.title}>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											{stat.title}
										</p>
										<div className="flex items-baseline gap-2">
											<p className="text-2xl font-bold">{stat.value}</p>
											<p className="text-sm text-muted-foreground">
												of {stat.total}
											</p>
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											{stat.description}
										</p>
									</div>
									<div className={`p-2 rounded-lg ${stat.bgColor}`}>
										<stat.icon className={`h-5 w-5 ${stat.color}`} />
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			<div>
				<h2 className="text-xl font-semibold mb-4">Action Required</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{actionCards.map((card) => (
						<Card key={card.title}>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											{card.title}
										</p>
										<p className="text-2xl font-bold">{card.value}</p>
										<p className="text-xs text-muted-foreground mt-1">
											{card.description}
										</p>
									</div>
									<div className={`p-2 rounded-lg ${card.bgColor}`}>
										<card.icon className={`h-5 w-5 ${card.color}`} />
									</div>
								</div>
								{card.value > 0 && (
									<Badge variant="secondary" className="mt-2 text-xs">
										Requires Review
									</Badge>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
