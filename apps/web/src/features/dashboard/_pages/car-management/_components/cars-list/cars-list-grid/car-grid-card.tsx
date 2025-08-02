import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Car } from "server/types";
import { CarDetailsDialog } from "./car-details-dialog";

interface CarGridCardProps {
	car: Car;
}

const CarGridCard: React.FC<CarGridCardProps> = ({ car }) => {
	const [showDetails, setShowDetails] = useState(false)
	const mainImage = car.images?.find((image) => image.isMain)

	return (
		<>
			<Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 max-w-sm py-0 gap-0 flex flex-col h-full">
				<div className="aspect-[4/3] relative">
					<img
						src={mainImage?.url || "/placeholder.svg"}
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
				<CardContent className="flex flex-col p-2 gap-4 flex-1">
					{/* Description */}
					{car.description && (
						<div>
							<h3 className="text-sm font-semibold mb-2">Description</h3>
							<p className="text-xs text-muted-foreground line-clamp-3">{car.description}</p>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex justify-between items-center p-2 mt-auto">
					{/* View Details Button */}
					<Button variant="outline" className="w-full bg-transparent" onClick={() => setShowDetails(true)}>
						View Details
					</Button>
				</CardFooter>
			</Card>
			<CarDetailsDialog car={car} open={showDetails} onOpenChange={setShowDetails} />
		</>
	);
};

export default CarGridCard;
