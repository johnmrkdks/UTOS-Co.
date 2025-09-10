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
import { Check, Crown, Users, Clock } from "lucide-react";
import { CarPriceDisplay } from "@/features/marketing/_pages/vehicle-selection/_components/car-price-display";
import { Link } from "@tanstack/react-router";
import { useUserQuery } from "@/hooks/query/use-user-query";

export type BookingProps = {
	id: string; // Add carId for pricing lookup
	model: string;
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
			"relative bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group",
			popular && "ring-2 ring-primary ring-offset-2 ring-offset-background",
			className
		)} {...props}>
			{popular && (
				<div className="absolute top-4 right-4 z-10">
					<Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
						<Crown className="w-3 h-3 mr-1" />
						Most Popular
					</Badge>
				</div>
			)}
			
			<CardHeader className="pb-3">
				<div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
					<img 
						src={image || placeHolder} 
						alt={model} 
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
					/>
				</div>
				<CardTitle className="text-lg font-bold text-card-foreground mb-1">{model}</CardTitle>
				<p className="text-muted-foreground text-xs leading-tight line-clamp-2">{description}</p>
			</CardHeader>
			
			<CardContent className="space-y-4">
				{/* Features - Compact */}
				<div className="space-y-2">
					<h4 className="font-semibold text-card-foreground text-xs">Features:</h4>
					<div className="grid grid-cols-2 gap-1">
						{features.slice(0, 4).map((feature, index) => (
							<div key={index} className="flex items-center gap-1">
								<Check className="w-3 h-3 text-primary flex-shrink-0" />
								<span className="text-muted-foreground text-xs truncate">{feature}</span>
							</div>
						))}
					</div>
				</div>
				
				{/* Dynamic Pricing - Compact */}
				<div className="bg-beige/50 rounded-lg p-3">
					<div className="text-center space-y-2">
						<CarPriceDisplay 
							carId={id}
							variant="card"
							className="text-center"
						/>
						<div className="flex justify-center items-center gap-1 text-muted-foreground text-xs">
							<Clock className="w-3 h-3" />
							<span>Flexible duration</span>
						</div>
					</div>
				</div>
			</CardContent>
			
			<CardFooter className="pt-3">
				<Link to="/calculate-quote" search={{ selectedCarId: id }} className="w-full">
					<Button 
						className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
						size="sm"
					>
						Book Now
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}
