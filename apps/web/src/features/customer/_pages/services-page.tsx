import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { 
	Search, 
	MapPin, 
	Clock, 
	Users, 
	Star, 
	Package,
	Filter,
	Loader2
} from "lucide-react";
import { useState, useMemo } from "react";
import { useGetPublishedServicesQuery } from "@/features/customer/_hooks/query/use-get-published-services-query";
import { Link } from "@tanstack/react-router";

export function ServicesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeCategory, setActiveCategory] = useState("All");

	// Fetch published services (packages from customer perspective)
	const { data: servicesData, isLoading, error } = useGetPublishedServicesQuery({
		limit: 50,
		offset: 0,
	});

	const services = servicesData?.data || [];


	// Helper function to format price
	const formatPrice = (service: any) => {
		const serviceType = service.serviceType;
		if (serviceType === 'hourly' && service.hourlyRate) {
			return {
				price: `$${service.hourlyRate.toFixed(2)}`,
				unit: '/hour',
				type: 'Hourly'
			};
		} else if (service.fixedPrice) {
			return {
				price: `$${service.fixedPrice.toFixed(2)}`,
				unit: '',
				type: 'Fixed'
			};
		}
		return {
			price: '$0.00',
			unit: '',
			type: 'Fixed'
		};
	};

	// Helper function to format duration
	const formatDuration = (minutes?: number) => {
		if (!minutes) return "Custom duration";
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
		if (hours > 0) return `${hours} hours`;
		return `${mins} minutes`;
	};

	// Helper function to get service type display name
	const getServiceTypeDisplay = (serviceType: string) => {
		switch (serviceType) {
			case "transfer": return "Transfer";
			case "tour": return "Tour";
			case "event": return "Event";
			case "hourly": return "Hourly";
			default: return serviceType;
		}
	};

	// Get unique service types for filtering - memoized to prevent recalculation on every render
	const serviceTypes = useMemo(() => {
		return Array.from(new Set(services.map(s => (s as any).serviceType))).map(type => getServiceTypeDisplay(type));
	}, [services]);

	const filteredServices = useMemo(() => {
		return services.filter(service => {
		const matchesSearch = 
			service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(service as any).serviceType.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesCategory = activeCategory === "All" || getServiceTypeDisplay((service as any).serviceType) === activeCategory;

		return matchesSearch && matchesCategory;
		});
	}, [services, searchTerm, activeCategory]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Luxury Services</h1>
					<p className="text-gray-600">Discover our curated collection of premium travel services</p>
				</div>

				{/* Search and Filters */}
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search services..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Button variant="outline" className="flex items-center gap-2">
						<Filter className="h-4 w-4" />
						Filter
					</Button>
				</div>
			</div>

			{/* Service Categories */}
			<div className="w-full">
				{/* Mobile: Flex wrap, Desktop: Horizontal scroll */}
				<div className="flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto pb-2">
					{["All", ...serviceTypes].map((category) => (
						<Badge
							key={category}
							variant={category === activeCategory ? "default" : "secondary"}
							className="whitespace-nowrap cursor-pointer hover:bg-primary/20 transition-colors flex-shrink-0 px-3 py-1.5 text-sm font-medium"
							onClick={() => setActiveCategory(category)}
						>
							{category}
						</Badge>
					))}
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex justify-center items-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<span className="ml-2 text-gray-600">Loading services...</span>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="text-center py-12">
					<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load services</h3>
					<p className="text-gray-600">Please try again later</p>
				</div>
			)}

			{/* Services Grid */}
			{!isLoading && !error && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{filteredServices.length === 0 ? (
					<div className="text-center py-12 col-span-full">
						<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
						<p className="text-gray-600">Try adjusting your search or filter criteria</p>
					</div>
				) : (
					filteredServices.map((service) => {
						const pricing = formatPrice(service);
						return (
							<Card key={service.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border">
								{/* Service Image */}
								<div className="h-40 relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
									{service.bannerImageUrl && service.bannerImageUrl.trim() !== "" ? (
										<>
											<img
												src={service.bannerImageUrl}
												alt={service.name}
												className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
												onError={(e) => {
													// Show fallback design on image error
													e.currentTarget.parentElement!.innerHTML = `
														<div class="w-full h-full bg-gradient-to-br from-primary/5 via-primary/10 to-primary/20 flex items-center justify-center">
															<div class="text-center">
																<div class="w-12 h-12 mx-auto mb-2 bg-primary/20 rounded-xl flex items-center justify-center">
																	<svg class="w-6 h-6 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
																	</svg>
																</div>
																<p class="text-gray-600 font-medium text-xs px-2">${service.name}</p>
															</div>
														</div>
													`;
												}}
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
										</>
									) : (
										<div className="w-full h-full bg-gradient-to-br from-primary/5 via-primary/10 to-primary/20 flex items-center justify-center">
											<div className="text-center">
												<div className="w-12 h-12 mx-auto mb-2 bg-primary/20 rounded-xl flex items-center justify-center">
													<Package className="w-6 h-6 text-primary/60" />
												</div>
												<p className="text-gray-600 font-medium text-xs px-2">{service.name}</p>
											</div>
										</div>
									)}

									{/* Rate Type Badge */}
									<div className="absolute top-2 left-2">
										<Badge
											variant={pricing.type === 'Hourly' ? 'default' : 'secondary'}
											className="text-xs font-medium shadow-sm"
										>
											{pricing.type}
										</Badge>
									</div>

									{/* Service Type Badge */}
									<div className="absolute bottom-2 left-2">
										<Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs shadow-sm">
											{getServiceTypeDisplay((service as any).serviceType)}
										</Badge>
									</div>

									{/* Deposit Required Badge */}
									{service.depositRequired && (
										<div className="absolute top-2 right-2">
											<Badge variant="destructive" className="text-xs shadow-sm">
												Deposit Required
											</Badge>
										</div>
									)}
								</div>

								<CardContent className="p-4">
									<div className="space-y-3">
										{/* Header */}
										<div>
											<CardTitle className="text-sm font-semibold leading-tight mb-1 line-clamp-1">
												{service.name}
											</CardTitle>
											<CardDescription className="line-clamp-2 text-xs leading-relaxed min-h-[32px]">
												{service.description}
											</CardDescription>
										</div>

										{/* Pricing */}
										<div className="flex items-center justify-between">
											<div className="flex items-baseline gap-1">
												<span className="font-bold text-lg text-primary">
													{pricing.price}
												</span>
												{pricing.unit && (
													<span className="text-xs text-muted-foreground">
														{pricing.unit}
													</span>
												)}
											</div>

											{/* Service Stats */}
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<div className="flex items-center gap-1">
													<Users className="h-3 w-3" />
													<span>{service.maxPassengers || 4}</span>
												</div>
												{service.duration && (
													<div className="flex items-center gap-1">
														<Clock className="h-3 w-3" />
														<span>{Math.floor(service.duration / 60)}h</span>
													</div>
												)}
											</div>
										</div>

										{/* Service Features */}
										<div className="flex flex-wrap gap-1">
											{service.includesDriver && (
												<Badge variant="outline" className="text-xs">
													Driver
												</Badge>
											)}
											{service.includesFuel && (
												<Badge variant="outline" className="text-xs">
													Fuel
												</Badge>
											)}
											{service.includesTolls && (
												<Badge variant="outline" className="text-xs">
													Tolls
												</Badge>
											)}
											{service.includesWaiting && (
												<Badge variant="outline" className="text-xs">
													Waiting
												</Badge>
											)}
										</div>

										{/* Advance Booking Notice */}
										{service.advanceBookingHours && service.advanceBookingHours > 0 && (
											<div className="text-xs text-muted-foreground">
												Book {service.advanceBookingHours}h in advance
											</div>
										)}
									</div>

									{/* Action Buttons */}
									<div className="flex gap-2 mt-4 pt-3 border-t">
										<Button className="flex-1 text-xs" asChild>
											<Link to="/book-service/$serviceId" params={{ serviceId: service.id }}>
												<Package className="h-3 w-3 mr-1" />
												Book Service
											</Link>
										</Button>
										<Button variant="outline" size="sm" className="text-xs">
											<MapPin className="h-3 w-3" />
										</Button>
									</div>
								</CardContent>
							</Card>
						);
					})
				)}
				</div>
			)}

			{/* Call to Action */}
			<Card className="bg-primary/5 border-primary/20">
				<CardContent className="p-6 text-center">
					<h3 className="text-lg font-semibold mb-2">Need a Custom Service?</h3>
					<p className="text-gray-600 mb-4">
						Can't find what you're looking for? Get an instant quote for a custom car booking.
					</p>
					<Button variant="outline" asChild>
						<Link to="/calculate-quote" search={{ selectedCarId: "" }}>Get Instant Quote</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}