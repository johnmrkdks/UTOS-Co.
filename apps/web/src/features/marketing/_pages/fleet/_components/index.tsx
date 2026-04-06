import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Car } from "lucide-react";
import fleetTransportLineup from "@/assets/marketing/fleet-transport-lineup.png";
import { useGetPublishedCarsQuery } from "../_hooks/query/use-get-published-cars-query";
import { BookingCard } from "./booking-card";

type FleetProps = {
	className?: string;
};

export function Fleet({ className, ...props }: FleetProps) {
	// Fetch published cars - show all available cars
	const { data: carsData, isLoading: carsLoading } = useGetPublishedCarsQuery({
		limit: 50, // Increased to show more cars
	});

	const bookingCards =
		carsData?.data?.map((car: any, index: number) => {
			const sortedImages = [...(car.images || [])].sort(
				(a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
			);
			const mainImage =
				sortedImages.find((img: any) => img.isMain) || sortedImages[0];
			return {
				id: car.id,
				model: car.name,
				brand: car.brand?.name || car.model?.brand?.name || "Luxury",
				category: car.category?.name || "Economy",
				description: car.description,
				features: [
					`${car.seatingCapacity} seats`,
					car.luggageCapacity ? `${car.luggageCapacity} bags` : null,
					car.fuelType?.name || "Petrol",
					car.transmissionType?.name || "Automatic",
					"Air Conditioning",
					"USB Charging Ports",
				].filter(Boolean),
				image: mainImage?.url || "placeholder.svg",
				images: sortedImages.map((img: any) => ({
					url: img.url,
					altText: img.altText,
				})),
				popular: index === 1,
			};
		}) || [];
	return (
		<div className={cn("", className)} {...props}>
			{/* Hero — fleet lineup */}
			<section
				className="relative overflow-hidden bg-[center_42%] bg-cover bg-no-repeat py-20 md:py-28"
				style={{ backgroundImage: `url(${fleetTransportLineup})` }}
			>
				<div className="absolute inset-0 bg-gradient-to-br from-stone-950/90 via-stone-900/78 to-stone-950/92" />
				<div className="container relative z-10 mx-auto px-6 text-center">
					<p className="mb-3 font-medium text-[0.65rem] text-primary-secondary/95 uppercase tracking-[0.22em]">
						Fleet
					</p>
					<h1 className="mb-4 font-semibold text-3xl text-white tracking-tight md:text-4xl lg:text-5xl">
						Our fleet
					</h1>
					<p className="mx-auto max-w-xl text-base text-white/80 leading-relaxed md:text-lg">
						Sedans, people movers, and executive vans — presented for every
						journey.
					</p>
				</div>
			</section>

			{/* Vehicle Selection — solid surface so cards are the only vehicle imagery */}
			<section className="bg-muted/20 py-16 md:py-24">
				<div className="container mx-auto px-6">
					<div className="mb-12 text-center md:mb-16">
						<h2 className="mb-3 font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
							Vehicles
						</h2>
						<p className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
							Choose a vehicle — each booking includes a professional chauffeur.
						</p>
					</div>

					<div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
						{carsLoading ? (
							// Compact loading skeleton to match new design
							Array.from({ length: 6 }).map((_, index) => (
								<div
									key={index}
									className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-none"
								>
									{/* Image skeleton */}
									<div className="aspect-[4/3] animate-pulse bg-muted" />

									{/* Content skeleton */}
									<div className="space-y-4 p-4">
										{/* Title and description */}
										<div className="space-y-2">
											<div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
											<div className="h-3 w-full animate-pulse rounded bg-muted" />
											<div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
										</div>

										{/* Features skeleton */}
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<div className="h-4 w-4 animate-pulse rounded bg-muted" />
												<div className="h-4 w-20 animate-pulse rounded bg-muted" />
											</div>
											<div className="grid grid-cols-2 gap-1.5">
												{Array.from({ length: 4 }).map((_, i) => (
													<div
														key={i}
														className="flex items-center gap-2 rounded-lg bg-muted/50 p-2"
													>
														<div className="h-4 w-4 animate-pulse rounded bg-muted" />
														<div className="h-3 flex-1 animate-pulse rounded bg-muted" />
													</div>
												))}
											</div>
										</div>

										{/* Pricing skeleton */}
										<div className="rounded-lg bg-muted/30 p-3">
											<div className="mx-auto h-6 w-20 animate-pulse rounded bg-muted" />
										</div>

										{/* Button skeleton */}
										<div className="h-10 animate-pulse rounded-lg bg-muted" />
									</div>
								</div>
							))
						) : bookingCards.length > 0 ? (
							bookingCards.map((card: any) => (
								<BookingCard key={card.id} {...card} />
							))
						) : (
							// Empty state
							<div className="col-span-full py-16 text-center">
								<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-muted">
									<Car className="h-12 w-12 text-muted-foreground" />
								</div>
								<h3 className="mb-4 font-bold text-2xl text-foreground">
									No Vehicles Available
								</h3>
								<p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
									We're currently preparing our luxury fleet. Please check back
									soon or contact us for more information.
								</p>
								<Link to="/contact-us">
									<Button size="lg" className="px-8 py-6">
										Contact Us
									</Button>
								</Link>
							</div>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
