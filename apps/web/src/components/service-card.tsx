import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

interface Service {
	id: string;
	name: string;
	description?: string;
	fixedPrice?: number;
	hourlyRate?: number;
	maxPassengers?: number;
	duration?: number;
	serviceType: string;
	bannerImageUrl?: string;
	includesDriver?: boolean;
	includesFuel?: boolean;
	includesTolls?: boolean;
	depositRequired?: number;
	// Service type details
	packageServiceType?: {
		name: string;
		rateType: "fixed" | "hourly";
	};
}

interface ServiceCardProps {
	service: Service;
	className?: string;
}

export function ServiceCard({ service, className = "" }: ServiceCardProps) {
	// Helper functions
	const formatPrice = (price: number) => {
		return `$${price.toFixed(0)}`;
	};

	const getPriceDisplay = () => {
		const rateType = service.packageServiceType?.rateType;

		if (rateType === "hourly" && service.hourlyRate) {
			return {
				price: `$${service.hourlyRate.toFixed(0)}/hr`,
				label: "Hourly Rate",
				badgeText: `${formatPrice(service.hourlyRate)}/hr`,
			};
		}
		if (rateType === "fixed" && service.fixedPrice) {
			return {
				price: formatPrice(service.fixedPrice),
				label: "Fixed Price",
				badgeText: formatPrice(service.fixedPrice),
			};
		}
		// Fallback logic
		if (service.hourlyRate && service.hourlyRate > 0) {
			return {
				price: `$${service.hourlyRate.toFixed(0)}/hr`,
				label: "Hourly Rate",
				badgeText: `${formatPrice(service.hourlyRate)}/hr`,
			};
		}
		if (service.fixedPrice && service.fixedPrice > 0) {
			return {
				price: formatPrice(service.fixedPrice),
				label: "Fixed Price",
				badgeText: formatPrice(service.fixedPrice),
			};
		}
		return {
			price: "Contact for Price",
			label: "Custom Quote",
			badgeText: "Quote",
		};
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
			case "transfer":
				return "Transfer";
			case "tour":
				return "Private Tour";
			case "airport":
				return "Airport Transfer";
			case "business":
				return "Business Travel";
			default:
				return serviceType.charAt(0).toUpperCase() + serviceType.slice(1);
		}
	};

	return (
		<Card
			className={`group overflow-hidden transition-all duration-300 hover:shadow-xl ${className}`}
		>
			{/* Service Image Banner */}
			<div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
				{service.bannerImageUrl ? (
					<>
						<img
							src={service.bannerImageUrl}
							alt={service.name}
							className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
					</>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
						<Calendar className="h-16 w-16 text-primary/40" />
					</div>
				)}

				{/* Service Type Badge */}
				<div className="absolute top-4 left-4">
					<Badge className="border-0 bg-primary/90 text-primary-foreground shadow-lg">
						{getServiceTypeDisplay(service.serviceType)}
					</Badge>
				</div>

				{/* Price Badge */}
				<div className="absolute top-4 right-4">
					<Badge className="border-0 bg-green-600 font-bold text-sm text-white shadow-lg">
						{getPriceDisplay().badgeText}
					</Badge>
				</div>

				{/* Deposit Required Badge */}
				{service.depositRequired && (
					<div className="absolute bottom-4 left-4">
						<Badge
							variant="secondary"
							className="border-white/30 bg-white/20 text-white backdrop-blur-sm"
						>
							Deposit Required
						</Badge>
					</div>
				)}
			</div>

			{/* Card Content */}
			<CardHeader className="pb-4">
				<div className="flex items-start justify-between gap-3">
					<div className="flex-1">
						<CardTitle className="font-bold text-xl transition-colors group-hover:text-primary">
							{service.name}
						</CardTitle>
						{service.description && (
							<p className="mt-1 text-muted-foreground text-sm leading-relaxed">
								{service.description}
							</p>
						)}
					</div>
					<div className="flex-shrink-0 text-right">
						<div className="font-bold text-2xl text-primary">
							{getPriceDisplay().price}
						</div>
						<div className="text-muted-foreground text-xs">
							{getPriceDisplay().label}
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Service Details */}
				<div className="grid grid-cols-2 gap-3">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<Clock className="h-4 w-4 text-primary" />
						<span>{formatDuration(service.duration)}</span>
					</div>
				</div>

				{/* Book Button */}
				<div className="pt-2">
					<Button
						asChild
						className="w-full transition-shadow group-hover:shadow-md"
					>
						<Link
							to="/book-service/$serviceId"
							params={{ serviceId: service.id }}
						>
							Book This Service
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
