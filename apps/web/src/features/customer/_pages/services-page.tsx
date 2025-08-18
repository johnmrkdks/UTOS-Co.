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
import { useState } from "react";
import { useGetPublishedServicesQuery } from "@/features/customer/_hooks/query/use-get-published-services-query";
import { Link } from "@tanstack/react-router";

export function ServicesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeCategory, setActiveCategory] = useState("All");

	// Fetch published services (packages from customer perspective)
	const { data: servicesData, isLoading, error } = useGetPublishedServicesQuery({
		search: searchTerm,
		limit: 50,
		offset: 0,
	});

	const services = servicesData?.data || [];

	// Helper function to format price
	const formatPrice = (priceInCents: number) => {
		return `$${(priceInCents / 100).toFixed(0)}`;
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

	// Get unique service types for filtering
	const serviceTypes = Array.from(new Set(services.map(s => s.serviceType))).map(type => getServiceTypeDisplay(type));

	const filteredServices = services.filter(service => {
		const matchesSearch = 
			service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesCategory = activeCategory === "All" || getServiceTypeDisplay(service.serviceType) === activeCategory;
		
		return matchesSearch && matchesCategory;
	});

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
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredServices.length === 0 ? (
					<div className="text-center py-12 col-span-full">
						<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
						<p className="text-gray-600">Try adjusting your search or filter criteria</p>
					</div>
				) : (
					filteredServices.map((service) => (
						<Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
							{/* Service Image */}
							<div className="h-48 bg-gray-200 relative">
								{service.bannerImageUrl && (
									<img 
										src={service.bannerImageUrl} 
										alt={service.name}
										className="w-full h-full object-cover"
									/>
								)}
								<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
								<div className="absolute bottom-4 left-4 text-white">
									<Badge variant="secondary" className="bg-white/20 text-white border-white/30">
										{getServiceTypeDisplay(service.serviceType)}
									</Badge>
								</div>
								{service.depositRequired && (
									<div className="absolute top-4 right-4">
										<Badge variant="secondary" className="bg-white/20 text-white border-white/30">
											Deposit Required
										</Badge>
									</div>
								)}
							</div>

							<CardHeader className="pb-3">
								<div className="flex justify-between items-start">
									<CardTitle className="text-lg">{service.name}</CardTitle>
									<span className="text-xl font-bold text-primary">{formatPrice(service.fixedPrice)}</span>
								</div>
								<CardDescription className="text-sm">{service.description}</CardDescription>
							</CardHeader>

							<CardContent className="space-y-4">
								{/* Service Details */}
								<div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4" />
										<span>{formatDuration(service.duration)}</span>
									</div>
									<div className="flex items-center gap-2">
										<Users className="h-4 w-4" />
										<span>{service.maxPassengers || 4} passengers</span>
									</div>
								</div>

								{/* Service Features */}
								<div className="flex flex-wrap gap-1">
									{service.includesDriver && (
										<Badge variant="outline" className="text-xs">
											Driver Included
										</Badge>
									)}
									{service.includesFuel && (
										<Badge variant="outline" className="text-xs">
											Fuel Included
										</Badge>
									)}
									{service.includesTolls && (
										<Badge variant="outline" className="text-xs">
											Tolls Included
										</Badge>
									)}
									{service.includesWaiting && (
										<Badge variant="outline" className="text-xs">
											Waiting Time
										</Badge>
									)}
								</div>

								{/* Advance Booking Notice */}
								{service.advanceBookingHours && service.advanceBookingHours > 0 && (
									<div className="text-xs text-gray-500">
										Book at least {service.advanceBookingHours}h in advance
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex gap-2 pt-2">
									<Button className="flex-1" asChild>
										<Link to="/customer/book-service/$serviceId" params={{ serviceId: service.id }}>
											<Package className="h-4 w-4 mr-2" />
											Book Service
										</Link>
									</Button>
									<Button variant="outline" size="icon">
										<MapPin className="h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))
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
						<a href="/customer/instant-quote">Get Instant Quote</a>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}