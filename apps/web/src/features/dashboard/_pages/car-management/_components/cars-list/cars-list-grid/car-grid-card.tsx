import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Car } from "server/types"

import placeholder from "@/assets/placeholder.svg"

type CarGridCardProps = {
	car: Car
}

export function CarGridCard({ car }: CarGridCardProps) {
	return (
		<Card key={car.id} className="overflow-hidden">
			<div className="aspect-video relative">
				<img src={car?.images?.at(0)?.url || placeholder} alt={car.name} className="object-fill" />
			</div>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg">{car.name}</CardTitle>
						<CardDescription>
							{`${car.brand?.name} • ${car.model?.name} • ${car.model?.year}`}
						</CardDescription>
					</div>
					<Badge variant="secondary">{car.conditionType?.name}</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Mileage:</span>
						<span>{car.mileage.toLocaleString()} miles</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Fuel:</span>
						{<span>{car.fuelType?.name}</span>}
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Body:</span>
						{<span>{car.bodyType?.name}</span>}
					</div>
				</div>
			</CardContent>
			<CardFooter>
			</CardFooter>
		</Card>
	)
}
