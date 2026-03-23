import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";

interface CarDisplayProps {
	car: any;
}

export function CarDisplay({ car }: CarDisplayProps) {
	return (
		<Card className="mb-4 overflow-hidden border-0 shadow-lg sm:mb-8">
			<CardContent className="p-0">
				<div className="flex flex-col lg:flex-row">
					<div className="relative h-32 w-full flex-shrink-0 sm:h-48 lg:h-32 lg:w-48 xl:h-40 xl:w-64">
						<img
							src={car.images?.[0]?.url || "/api/placeholder/400/240"}
							alt={`${car.model?.brand?.name} ${car.model?.name}`}
							className="h-full w-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
					</div>
					<div className="flex flex-1 flex-col justify-center p-3 sm:p-6 lg:p-8">
						<div className="mb-2 flex items-center gap-2">
							<Badge variant="secondary" className="font-medium text-xs">
								{car.category?.name}
							</Badge>
							<div className="flex items-center gap-1 text-green-600 text-xs">
								<div className="h-1.5 w-1.5 rounded-full bg-green-600" />
								Available
							</div>
						</div>
						<h3 className="font-bold text-lg sm:text-xl lg:text-2xl">
							{car.model?.brand?.name} {car.model?.name}
						</h3>
						<p className="mb-3 text-muted-foreground text-sm sm:mb-4 sm:text-base lg:text-lg">
							{car.model?.year} • {car.seatingCapacity} passengers •{" "}
							{(car as any).luggageCapacity || "Standard luggage"}
						</p>
						<div className="flex flex-wrap gap-1 sm:gap-2">
							{(car as any)?.carsToFeatures
								?.slice(0, 3)
								.map((carFeature: any) => (
									<Badge
										key={carFeature.feature.id}
										variant="outline"
										className="text-xs"
									>
										{carFeature.feature.name}
									</Badge>
								))}
							{(car as any)?.carsToFeatures &&
								(car as any).carsToFeatures.length > 3 && (
									<Badge variant="outline" className="text-xs">
										+{(car as any).carsToFeatures.length - 3} more
									</Badge>
								)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
