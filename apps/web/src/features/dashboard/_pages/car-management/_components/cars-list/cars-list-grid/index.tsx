import CarGridCard from "./car-grid-card"
import { CarGridSkeleton } from "./car-grid-skeleton"
import type { Car } from "server/types"
import { cn } from "@/lib/utils"
import { EmptyCarsList } from "./empty-cars-list"

type CarGridCardProps = {
	cars: Car[]
	isLoading: boolean
	className?: string
}

export function CarsListGrid({ cars = [], isLoading, className, ...props }: CarGridCardProps) {
	if (isLoading) {
		return (
			<div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)} {...props}>
				{Array.from({ length: 8 }).map((_, index) => (
					<CarGridSkeleton key={index} />
				))}
			</div>
		)
	}

	if (cars.length === 0) {
		return <EmptyCarsList />
	}

	return (
		<div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)} {...props}>
			{cars.map((car) => (
				<CarGridCard key={car.id} car={car} />
			))}
		</div>
	)
}

