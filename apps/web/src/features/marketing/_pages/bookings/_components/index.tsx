import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { BookingCard } from "./booking-card";
import { Link } from "@tanstack/react-router";
import { useGetPublishedCarsQuery } from "../_hooks/query/use-get-published-cars-query";
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

type BookingProps = {
	className?: string;
};

export function Booking({ className, ...props }: BookingProps) {
	// Fetch published cars
	const { data: carsData, isLoading: carsLoading } = useGetPublishedCarsQuery({
		limit: 5
	});

	const bookingCards = carsData?.data?.map((car: any, index: number) => ({
		model: car.name,
		description: car.description,
		features: [
			`${car.seatingCapacity} passengers`,
			car.category?.name || "Luxury vehicle",
			car.fuelType?.name || "Premium fuel",
			car.transmissionType?.name || "Automatic"
		].filter(Boolean),
		pricing: {
			airport: "Contact for pricing",
			hourly: "Contact for pricing", 
			minimum: "2 hours"
		},
		image: car.images?.find((img: any) => img.isMain)?.url || "placeholder.svg",
		popular: index === 1 // Mark second car as popular
	})) || [];
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

					<div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
						{carsLoading ? (
							// Loading skeleton
							Array.from({ length: 5 }).map((_, index) => (
								<div key={index} className="bg-card rounded-2xl border border-border p-6">
									<div className="h-48 bg-muted rounded-xl mb-6 animate-pulse" />
									<div className="space-y-4">
										<div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
										<div className="h-4 bg-muted rounded w-full animate-pulse" />
										<div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
										<div className="space-y-2">
											{Array.from({ length: 4 }).map((_, i) => (
												<div key={i} className="h-4 bg-muted rounded w-4/5 animate-pulse" />
											))}
										</div>
										<div className="pt-4 space-y-2">
											<div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
											<div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
										</div>
										<div className="h-10 bg-muted rounded animate-pulse" />
									</div>
								</div>
							))
						) : bookingCards.length > 0 ? (
							bookingCards.map((card: any) => (
								<BookingCard key={card.model} {...card} />
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
