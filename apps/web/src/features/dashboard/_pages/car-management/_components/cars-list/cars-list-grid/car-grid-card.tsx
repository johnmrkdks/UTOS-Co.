import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Car } from "lucide-react"
import { useState } from "react"
import type { Car as CarType } from "server/types"
import { Badge } from "@/components/ui/badge"
import { CarDetailsDialog } from "./car-details-dialog"

type CarGridCardProps = {
	car: CarType
}

export function CarGridCard({ car }: CarGridCardProps) {
	const [showDetails, setShowDetails] = useState(false)
	const mainImage = car.images?.find((image) => image.isMain)

	return (
		<>
			<Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 max-w-sm py-0 gap-0">
				<div className="aspect-video relative">
					<img
						src={mainImage?.url || "/placeholder.svg?height=200&width=300&query=luxury car showroom"}
						alt={car.name}
						className="object-cover w-full h-full"
					/>

					{/* Status badges */}
					<div className="absolute top-3 left-3 flex gap-2">
						<Badge
							variant={car.isAvailable ? "default" : "secondary"}
							className="text-xs bg-black/70 text-white border-0"
						>
							{car.isAvailable ? "available" : "unavailable"}
						</Badge>
						{car.category && (
							<Badge variant="secondary" className="text-xs bg-white/90 text-black">
								{car.category.name}
							</Badge>
						)}
					</div>
				</div>

				<CardHeader className="p-2 gap-0">
					<CardTitle className="text-lg font-semibold">{car.name}</CardTitle>
					<p className="text-xs text-muted-foreground">
						{car.model?.name} • {car.model?.brand?.name} • {car.model?.year}
					</p>
				</CardHeader>

				<CardContent className="flex flex-col p-2 gap-4">
					{/* Description */}
					{car.description && (
						<div>
							<h3 className="text-sm font-semibold mb-2">Description</h3>
							<p className="text-xs text-muted-foreground line-clamp-3">{car.description}</p>
						</div>
					)}
				</CardContent>

				<CardFooter className="flex justify-between items-center p-2">

					{/* View Details Button */}
					<Button variant="outline" className="w-full bg-transparent" onClick={() => setShowDetails(true)}>
						View Details
					</Button>
				</CardFooter>
			</Card>

			<CarDetailsDialog car={car} open={showDetails} onOpenChange={setShowDetails} />
		</>
	)
}

