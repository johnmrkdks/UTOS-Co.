import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import placeHolder from "@/assets/placeholder.svg";
import { Check, Crown, Users, Car, Fuel, Settings, ArrowRight, Briefcase } from "lucide-react";
import { CarPriceDisplay } from "@/features/marketing/_pages/vehicle-selection/_components/car-price-display";
import { Link } from "@tanstack/react-router";
import { useUserQuery } from "@/hooks/query/use-user-query";

export type BookingProps = {
	id: string; // Add carId for pricing lookup
	model: string;
	brand: string;
	category: string;
	description: string;
	features: string[];
	image?: string;
	popular?: boolean;
}

type BookingCardProps = BookingProps & {
	className?: string;
};

export function BookingCard({
	id,
	model,
	brand,
	category,
	description,
	features,
	image,
	popular,
	className,
	...props
}: BookingCardProps) {
	const { session } = useUserQuery();
	return (
		<Card className={cn(
			"relative bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-xl p-0",
			popular && "ring-2 ring-primary border-primary",
			className
		)} {...props}>
			{/* Hero Image Section */}
			<div className="relative aspect-[3/2] bg-gray-50 overflow-hidden rounded-t-xl">
				<img 
					src={image || placeHolder} 
					alt={`${brand} ${model}`} 
					className="w-full h-full object-cover rounded-t-xl"
				/>
				
				{/* Category Badge */}
				<div className="absolute top-0 left-0 z-20">
					<Badge className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium border-0 rounded-tl-xl rounded-br-md">
						{category}
					</Badge>
				</div>
				
				{/* Popular Badge */}
				{popular && (
					<div className="absolute top-0 right-0 z-20">
						<div className="w-6 h-6 bg-primary rounded-tr-xl rounded-bl-full flex items-center justify-center">
							<Check className="w-4 h-4 text-white" />
						</div>
					</div>
				)}
			</div>
			
			{/* Content Section */}
			<div className="p-4">
				{/* Title and Price Row */}
				<div className="flex items-start justify-between mb-3">
					<div>
						<h3 className="font-semibold text-gray-900 text-lg mb-1">
							{model}
						</h3>
						<p className="text-gray-600 text-sm">
							{brand} {model}
						</p>
					</div>
					<div className="text-right">
						<CarPriceDisplay 
							carId={id}
							variant="card"
							className=""
						/>
					</div>
				</div>
				
				{/* Feature Icons Row */}
				<div className="flex items-center gap-4 mb-4">
					{features.slice(0, 3).map((feature, index) => {
						const getFeatureIcon = (feature: string) => {
							if (feature.toLowerCase().includes('passenger') || feature.toLowerCase().includes('seat')) return { icon: Users, text: feature };
							if (feature.toLowerCase().includes('bag') || feature.toLowerCase().includes('luggage')) return { icon: Briefcase, text: feature };
							if (feature.toLowerCase().includes('petrol') || feature.toLowerCase().includes('fuel')) return { icon: Fuel, text: feature };
							if (feature.toLowerCase().includes('automatic') || feature.toLowerCase().includes('transmission')) return { icon: Settings, text: feature };
							return { icon: Car, text: feature };
						};
						
						const { icon: IconComponent, text } = getFeatureIcon(feature);
						
						return (
							<div key={index} className="flex items-center gap-1 text-gray-600">
								<IconComponent className="w-4 h-4" />
								<span className="text-xs">{text}</span>
							</div>
						);
					})}
				</div>
				
				{/* Feature Badges */}
				<div className="flex flex-wrap gap-2 mb-4">
					{features.slice(3, 6).map((feature, index) => (
						<Badge key={index} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-normal border-0 rounded-md">
							{feature}
						</Badge>
					))}
					{features.length > 6 && (
						<Badge className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-normal border-0 rounded-md">
							+{features.length - 6} more
						</Badge>
					)}
				</div>
				
				{/* Description */}
				<p className="text-gray-600 text-sm mb-4 line-clamp-2">
					{description}
				</p>
				
				{/* Button Section */}
				<div className="mt-4">
					<Link to="/calculate-quote" search={{ selectedCarId: id }} className="block">
						<Button 
							className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-base font-medium rounded-lg"
						>
							Book
						</Button>
					</Link>
				</div>
			</div>
		</Card>
	);
}
