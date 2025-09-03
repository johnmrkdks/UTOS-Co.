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
			
			<CardHeader className="pb-4">
				<div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
					<img 
						src={image || placeHolder} 
						alt={model} 
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
					/>
				</div>
				<CardTitle className="text-xl font-bold text-card-foreground mb-2">{model}</CardTitle>
				<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
			</CardHeader>
			
			<CardContent className="space-y-6">
				{/* Features */}
				<div className="space-y-3">
					<h4 className="font-semibold text-card-foreground text-sm">Features Included:</h4>
					<div className="space-y-2">
						{features.map((feature, index) => (
							<div key={index} className="flex items-center gap-2">
								<Check className="w-4 h-4 text-primary flex-shrink-0" />
								<span className="text-muted-foreground text-sm">{feature}</span>
							</div>
						))}
					</div>
				</div>
				
				{/* Dynamic Pricing */}
				<div className="bg-beige/50 rounded-lg p-4 space-y-3">
					<h4 className="font-semibold text-foreground text-sm mb-3">Starting From:</h4>
					<div className="flex justify-center">
						<CarPriceDisplay 
							carId={id}
							variant="card"
							className="text-center"
						/>
					</div>
					<div className="text-center">
						<div className="flex justify-center items-center gap-1 text-muted-foreground text-xs">
							<Clock className="w-3 h-3" />
							<span>2 hour minimum booking</span>
						</div>
					</div>
				</div>
			</CardContent>
			
			<CardFooter className="pt-6">
				<div className="w-full space-y-3">
					{session?.user ? (
						// Authenticated user: route to customer instant quote with pre-selected car
						<Link to="/customer/instant-quote" search={{ selectedCarId: id }}>
							<Button 
								className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
								size="lg"
							>
								Book Now
							</Button>
						</Link>
					) : (
						// Guest user: use existing public flow
						<Link to="/" search={{ directBooking: true, carId: id }}>
							<Button 
								className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
								size="lg"
							>
								Book Now
							</Button>
						</Link>
					)}
					<Link to="/">
						<Button 
							variant="outline"
							className="w-full border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary py-3 text-sm font-medium rounded-lg"
						>
							Get Quote
						</Button>
					</Link>
				</div>
			</CardFooter>
		</Card>
	);
}
