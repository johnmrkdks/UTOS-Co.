import { CarGridCard } from "./car-grid-card";
import type { Car } from "server/types";
import { cn } from "@/lib/utils";

type CarGridCardProps = {
	cars: Car[]
	isLoading: boolean
	className?: string
}

export function CarsListGrid({ cars = [], isLoading, className, ...props }: CarGridCardProps) {

	if (isLoading) {
		return (
			<>Loading...</>
		)
	}

	return (
		<div className={cn("gap-4", className)} {...props}>
			{
				cars.map((car) => (
					<CarGridCard key={car.id} car={car} />
				))
			}
		</div>
	)
}
