import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { BookingCard } from "./booking-card";
import { Link } from "@tanstack/react-router";
import { useGetPublishedCarsQuery } from "../_hooks/query/use-get-published-cars-query";
import { CarPriceDisplay } from "@/features/marketing/_pages/vehicle-selection/_components/car-price-display";
import {
	Car,
	Calendar,
	Clock,
	MapPin,
	Shield,
	Star,
	Phone,
	Users,
	Luggage,
	Wifi,
	Coffee,
	Award
} from "lucide-react";


const serviceFeatures = [
	{
		icon: Shield,
		title: "Licensed & Insured",
		description: "Fully licensed chauffeurs with comprehensive insurance"
	},
	{
		icon: Clock,
		title: "Available 00:00 – 23:45",
		description: "Nearly 24/7 service - we are always at your disposal"
	},
	{
		icon: Star,
		title: "5-Star Service",
		description: "Consistently rated excellent by our valued clients"
	},
	{
		icon: Award,
		title: "Premium Fleet",
		description: "Luxury vehicles maintained to the highest standards"
	}
];

type FleetProps = {
	className?: string;
};

export function Fleet({ className, ...props }: FleetProps) {
	// Fetch published cars - show all available cars
	const { data: carsData, isLoading: carsLoading } = useGetPublishedCarsQuery({
		limit: 50 // Increased to show more cars
	});

	const bookingCards = carsData?.data?.map((car: any, index: number) => {
		const sortedImages = [...(car.images || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
		const mainImage = sortedImages.find((img: any) => img.isMain) || sortedImages[0];
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
				"USB Charging Ports"
			].filter(Boolean),
			image: mainImage?.url || "placeholder.svg",
			images: sortedImages.map((img: any) => ({ url: img.url, altText: img.altText })),
			popular: index === 1
		};
	}) || [];
	return (
		<div className={cn("", className)} {...props}>
			{/* Vehicle Selection */}
			<section className="py-24 bg-soft-beige">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-foreground mb-4">
							Select Your Luxury Vehicle
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Choose from our premium fleet of meticulously maintained luxury vehicles.
							Each vehicle comes with a professional chauffeur and premium amenities.
						</p>
					</div>

					<div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">
						{carsLoading ? (
							// Compact loading skeleton to match new design
							Array.from({ length: 6 }).map((_, index) => (
								<div key={index} className="bg-white border border-border shadow-lg rounded-lg overflow-hidden">
									{/* Image skeleton */}
									<div className="aspect-[4/3] bg-muted animate-pulse" />
									
									{/* Content skeleton */}
									<div className="p-4 space-y-4">
										{/* Title and description */}
										<div className="space-y-2">
											<div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
											<div className="h-3 bg-muted rounded w-full animate-pulse" />
											<div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
										</div>
										
										{/* Features skeleton */}
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<div className="w-4 h-4 bg-muted rounded animate-pulse" />
												<div className="h-4 bg-muted rounded w-20 animate-pulse" />
											</div>
											<div className="grid grid-cols-2 gap-1.5">
												{Array.from({ length: 4 }).map((_, i) => (
													<div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
														<div className="w-4 h-4 bg-muted rounded animate-pulse" />
														<div className="h-3 bg-muted rounded flex-1 animate-pulse" />
													</div>
												))}
											</div>
										</div>
										
										{/* Pricing skeleton */}
										<div className="bg-muted/30 rounded-lg p-3">
											<div className="h-6 bg-muted rounded w-20 mx-auto animate-pulse" />
										</div>
										
										{/* Button skeleton */}
										<div className="h-10 bg-muted rounded-lg animate-pulse" />
									</div>
								</div>
							))
						) : bookingCards.length > 0 ? (
							bookingCards.map((card: any) => (
								<BookingCard key={card.id} {...card} />
							))
						) : (
							// Empty state
							<div className="col-span-full text-center py-16">
								<div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
									<Car className="w-12 h-12 text-muted-foreground" />
								</div>
								<h3 className="text-2xl font-bold text-foreground mb-4">
									No Vehicles Available
								</h3>
								<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
									We're currently preparing our luxury fleet. Please check back soon or contact us for more information.
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
