import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { BookingCard } from "./booking-card";
import { Link } from "@tanstack/react-router";
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

const bookingCards = [{
	model: "Euro Sedan",
	description: "Perfect for executive travel and airport transfers. Seats up to 3 passengers in luxury and comfort.",
	features: ["Airport transfers", "Executive comfort", "3 passengers", "Professional chauffeur"],
	pricing: {
		airport: "$110",
		hourly: "$100/hr",
		minimum: "4 hours"
	},
	image: "placeholder.svg",
	popular: false
}, {
	model: "Premium SUV",
	description: "Spacious luxury SUV ideal for families and groups. Enhanced comfort with premium amenities.",
	features: ["Family friendly", "Premium comfort", "5 passengers", "Extra luggage space"],
	pricing: {
		airport: "$140",
		hourly: "$110/hr",
		minimum: "4 hours"
	},
	image: "placeholder.svg",
	popular: true
}, {
	model: "Mercedes V-Class Van",
	description: "Luxury 7-seater van perfect for group travel and special events. Ultimate comfort and style.",
	features: ["7 passengers", "Luxury interior", "Group travel", "Special events"],
	pricing: {
		airport: "$160",
		hourly: "$130/hr",
		minimum: "2 hours"
	},
	image: "placeholder.svg",
	popular: false
}, {
	model: "12 Seater Sprinter Bus",
	description: "Luxury coach for larger groups. Perfect for corporate events, weddings, and group transfers.",
	features: ["12 passengers", "Corporate events", "Wedding parties", "Group transfers"],
	pricing: {
		airport: "$180",
		hourly: "$150/hr",
		minimum: "2 hours"
	},
	image: "placeholder.svg",
	popular: false
}, {
	model: "15 Seater Sprinter Bus",
	description: "Our largest luxury vehicle for maximum group capacity. Ideal for large corporate groups and events.",
	features: ["15 passengers", "Large groups", "Corporate travel", "Event transportation"],
	pricing: {
		airport: "$210",
		hourly: "$175/hr",
		minimum: "2 hours"
	},
	image: "placeholder.svg",
	popular: false
}]

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
						{bookingCards.map((card) => (
							<BookingCard key={card.model} {...card} />
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
