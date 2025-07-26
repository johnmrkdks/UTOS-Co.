import { CarGridCard } from "./car-grid-card";
import type { Car } from "server/types";
import { cn } from "@/lib/utils";

type CarGridCardProps = {
	cars: Car[]
	className?: string
}

export function CarsListGrid({ cars, className, ...props }: CarGridCardProps) {
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
