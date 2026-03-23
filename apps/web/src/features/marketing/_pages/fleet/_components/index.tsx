import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	Award,
	Calendar,
	Car,
	Clock,
	Coffee,
	Luggage,
	MapPin,
	Phone,
	Shield,
	Star,
	Users,
	Wifi,
} from "lucide-react";
import { CarPriceDisplay } from "@/features/marketing/_pages/vehicle-selection/_components/car-price-display";
import { useGetPublishedCarsQuery } from "../_hooks/query/use-get-published-cars-query";
import { BookingCard } from "./booking-card";

const serviceFeatures = [
	{
		icon: Shield,
		title: "Licensed & Insured",
		description: "Fully licensed chauffeurs with comprehensive insurance",
	},
	{
		icon: Clock,
		title: "Available 00:00 – 23:45",
		description: "Nearly 24/7 service - we are always at your disposal",
	},
	{
		icon: Star,
		title: "5-Star Service",
		description: "Consistently rated excellent by our valued clients",
	},
	{
		icon: Award,
		title: "Premium Fleet",
		description: "Luxury vehicles maintained to the highest standards",
	},
];

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
			{/* Vehicle Selection */}
			<section className="bg-soft-beige py-24">
				<div className="container mx-auto px-6">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-4xl text-foreground">
							Select Your Luxury Vehicle
						</h2>
						<p className="mx-auto max-w-3xl text-muted-foreground text-xl">
							Choose from our premium fleet of meticulously maintained luxury
							vehicles. Each vehicle comes with a professional chauffeur and
							premium amenities.
						</p>
					</div>

					<div className="grid gap-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
						{carsLoading ? (
							// Compact loading skeleton to match new design
							Array.from({ length: 6 }).map((_, index) => (
								<div
									key={index}
									className="overflow-hidden rounded-lg border border-border bg-white shadow-lg"
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
