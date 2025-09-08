import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Clock, Users, MapPin, Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Service {
	id: string;
	name: string;
	description?: string;
	fixedPrice: number;
	maxPassengers?: number;
	duration?: number;
	serviceType: string;
	bannerImageUrl?: string;
	includesDriver?: boolean;
	includesFuel?: boolean;
	depositRequired?: boolean;
}

interface ServiceCardProps {
	service: Service;
	className?: string;
}

export function ServiceCard({ service, className = "" }: ServiceCardProps) {
	// Helper functions
	const formatPrice = (priceInCents: number) => {
		return `$${(priceInCents / 100).toFixed(0)}`;
	};

	const formatDuration = (minutes?: number) => {
		if (!minutes) return "Custom duration";
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
		if (hours > 0) return `${hours} hours`;
		return `${mins} minutes`;
	};

	const getServiceTypeDisplay = (serviceType: string) => {
		switch (serviceType) {
			case "transfer": return "Transfer";
			case "tour": return "Private Tour";
			case "airport": return "Airport Transfer";
			case "business": return "Business Travel";
			default: return serviceType.charAt(0).toUpperCase() + serviceType.slice(1);
		}
	};

	return (
		<Card className={`overflow-hidden hover:shadow-xl transition-all duration-300 group ${className}`}>
			{/* Service Image Banner */}
			<div className="h-48 relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
				{service.bannerImageUrl ? (
					<>
						<img 
							src={service.bannerImageUrl} 
							alt={service.name}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
					</>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
						<Calendar className="h-16 w-16 text-primary/40" />
					</div>
				)}
				
				{/* Service Type Badge */}
				<div className="absolute top-4 left-4">
					<Badge className="bg-primary/90 text-primary-foreground border-0 shadow-lg">
						{getServiceTypeDisplay(service.serviceType)}
					</Badge>
				</div>

				{/* Price Badge */}
				<div className="absolute top-4 right-4">
					<Badge className="bg-green-600 text-white border-0 shadow-lg font-bold">
						{formatPrice(service.fixedPrice)}
					</Badge>
				</div>

				{/* Deposit Required Badge */}
				{service.depositRequired && (
					<div className="absolute bottom-4 left-4">
						<Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
							Deposit Required
						</Badge>
					</div>
				)}
			</div>

			{/* Card Content */}
			<CardHeader className="pb-4">
				<CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
					{service.name}
				</CardTitle>
				{service.description && (
					<p className="text-sm text-muted-foreground leading-relaxed">
						{service.description}
					</p>
				)}
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Service Details */}
				<div className="grid grid-cols-2 gap-3">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Clock className="h-4 w-4 text-primary" />
						<span>{formatDuration(service.duration)}</span>
					</div>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Users className="h-4 w-4 text-primary" />
						<span>Max {service.maxPassengers || 4}</span>
					</div>
				</div>

				{/* Service Features */}
				<div className="flex flex-wrap gap-2">
					{service.includesDriver && (
						<Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
							Professional Chauffeur
						</Badge>
					)}
					{service.includesFuel && (
						<Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
							Fuel Included
						</Badge>
					)}
					<Badge variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
						Fixed Price
					</Badge>
				</div>

				{/* Book Button */}
				<div className="pt-2">
					<Button asChild className="w-full group-hover:shadow-md transition-shadow">
						<Link to="/customer/book-service/$serviceId" params={{ serviceId: service.id }}>
							Book This Service
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}