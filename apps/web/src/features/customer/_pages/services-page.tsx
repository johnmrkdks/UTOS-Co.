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
	Filter
} from "lucide-react";
import { useState } from "react";

export function ServicesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeCategory, setActiveCategory] = useState("All");

	// Mock services data - this will be replaced with real data from tRPC
	const services = [
		{
			id: 1,
			name: "Airport Transfer Premium",
			description: "Luxury airport transfers with professional chauffeurs",
			price: "$120",
			duration: "1-2 hours",
			capacity: "1-4 passengers",
			rating: 4.9,
			features: ["WiFi", "Water", "Phone Charger"],
			image: "/placeholder-service.jpg",
			category: "Airport Transfer"
		},
		{
			id: 2,
			name: "City Tour Deluxe",
			description: "Guided city tour with stops at major attractions",
			price: "$280",
			duration: "4-6 hours",
			capacity: "1-6 passengers",
			rating: 4.8,
			features: ["Tour Guide", "Refreshments", "Photo Stops"],
			image: "/placeholder-service.jpg",
			category: "City Tour"
		},
		{
			id: 3,
			name: "Wine Country Experience",
			description: "Premium wine tasting tour with designated driver",
			price: "$350",
			duration: "6-8 hours",
			capacity: "1-6 passengers",
			rating: 4.9,
			features: ["Wine Tasting", "Lunch", "Vineyard Tours"],
			image: "/placeholder-service.jpg",
			category: "Wine Tour"
		},
		{
			id: 4,
			name: "Corporate Event Transfer",
			description: "Professional transportation for business events",
			price: "$200",
			duration: "2-4 hours",
			capacity: "1-8 passengers",
			rating: 4.7,
			features: ["Business Class", "WiFi", "Presentations"],
			image: "/placeholder-service.jpg",
			category: "Corporate"
		}
	];

	const filteredServices = services.filter(service => {
		const matchesSearch = 
			service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.category.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesCategory = activeCategory === "All" || service.category === activeCategory;
		
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
					{["All", "Airport Transfer", "City Tour", "Wine Tour", "Corporate"].map((category) => (
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

			{/* Services Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredServices.map((service) => (
					<Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
						{/* Service Image */}
						<div className="h-48 bg-gray-200 relative">
							<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
							<div className="absolute bottom-4 left-4 text-white">
								<Badge variant="secondary" className="bg-white/20 text-white border-white/30">
									{service.category}
								</Badge>
							</div>
							<div className="absolute top-4 right-4">
								<div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
									<Star className="h-3 w-3 text-yellow-400 fill-current" />
									<span className="text-white text-xs font-medium">{service.rating}</span>
								</div>
							</div>
						</div>

						<CardHeader className="pb-3">
							<div className="flex justify-between items-start">
								<CardTitle className="text-lg">{service.name}</CardTitle>
								<span className="text-xl font-bold text-primary">{service.price}</span>
							</div>
							<CardDescription className="text-sm">{service.description}</CardDescription>
						</CardHeader>

						<CardContent className="space-y-4">
							{/* Service Details */}
							<div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4" />
									<span>{service.duration}</span>
								</div>
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4" />
									<span>{service.capacity}</span>
								</div>
							</div>

							{/* Features */}
							<div className="flex flex-wrap gap-1">
								{service.features.slice(0, 3).map((feature) => (
									<Badge key={feature} variant="outline" className="text-xs">
										{feature}
									</Badge>
								))}
								{service.features.length > 3 && (
									<Badge variant="outline" className="text-xs">
										+{service.features.length - 3} more
									</Badge>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2 pt-2">
								<Button className="flex-1">
									<Package className="h-4 w-4 mr-2" />
									Book Service
								</Button>
								<Button variant="outline" size="icon">
									<MapPin className="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Empty State */}
			{filteredServices.length === 0 && (
				<div className="text-center py-12">
					<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
					<p className="text-gray-600">Try adjusting your search or filter criteria</p>
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