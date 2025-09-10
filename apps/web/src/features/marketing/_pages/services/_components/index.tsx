import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useGetPublishedPackagesQuery } from "../_hooks/query/use-get-published-packages-query";
import { useGetPublishedCarsQuery } from "../_hooks/query/use-get-published-cars-query";
import { CarPriceDisplay } from "@/features/marketing/_pages/vehicle-selection/_components/car-price-display";
import {
	Plane,
	Building,
	MapPin,
	Users,
	Star,
	Clock,
	Shield,
	Car,
	Sparkles,
	Calendar
} from "lucide-react";

// Service type to icon mapping
const serviceIcons: Record<string, any> = {
	transfer: Plane,
	tour: MapPin,
	event: Sparkles,
	hourly: Calendar,
	corporate: Building,
	vip: Users
};


type ServicesProps = {
	className?: string;
};

export function Services({ className, ...props }: ServicesProps) {
	// Fetch published packages - show all available services
	const { data: packagesData, isLoading: packagesLoading } = useGetPublishedPackagesQuery({
		limit: 50 // Increased to show more services
	});
	
	// Fetch published cars for fleet showcase
	const { data: carsData, isLoading: carsLoading } = useGetPublishedCarsQuery({
		limit: 12 // Increased to show more cars in fleet section
	});
	
	const services = packagesData?.data?.map((pkg: any) => ({
		id: pkg.id,
		icon: serviceIcons[pkg.serviceType] || Building,
		title: pkg.name,
		description: pkg.description,
		bannerImageUrl: pkg.bannerImageUrl,
		features: [
			`Max ${pkg.maxPassengers} passengers`,
			pkg.includesDriver ? "Professional chauffeur" : "Self-drive",
			pkg.includesFuel ? "Fuel included" : "Fuel not included",
			pkg.includesTolls ? "Tolls included" : "Tolls separate"
		].filter(Boolean),
		price: `From $${(pkg.fixedPrice / 100).toFixed(0)}`,
		popular: pkg.serviceType === "transfer" // Mark airport transfers as popular
	})) || [];
	
	const fleetHighlights = carsData?.data?.map((car: any) => ({
		id: car.id,
		name: car.name,
		type: car.category?.name || "Luxury Vehicle",
		passengers: `1-${car.seatingCapacity}`,
		image: car.images?.find((img: any) => img.isMain)?.url || "/images/placeholder-car.jpg"
	})) || [];
	return (
		<div className={cn("", className)} {...props}>
			{/* Services Grid */}
			<div className="py-24 bg-background">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-foreground mb-4">
							Our Premium Services
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Choose from our comprehensive range of luxury transportation services,
							each designed to exceed your expectations.
						</p>
					</div>

					<div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
						{packagesLoading ? (
							// Loading skeleton
							Array.from({ length: 6 }).map((_, index) => (
								<div key={index} className="bg-card border-2 border-border rounded-2xl p-8">
									<div className="flex items-center mb-6">
										<div className="w-14 h-14 bg-muted rounded-2xl mr-4 animate-pulse" />
										<div>
											<div className="h-5 bg-muted rounded w-32 mb-2 animate-pulse" />
											<div className="h-6 bg-muted rounded w-20 animate-pulse" />
										</div>
									</div>
									<div className="h-4 bg-muted rounded w-full mb-2 animate-pulse" />
									<div className="h-4 bg-muted rounded w-3/4 mb-6 animate-pulse" />
									<div className="space-y-3 mb-8">
										{Array.from({ length: 4 }).map((_, i) => (
											<div key={i} className="h-4 bg-muted rounded w-5/6 animate-pulse" />
										))}
									</div>
									<div className="h-12 bg-muted rounded animate-pulse" />
								</div>
							))
						) : services.length > 0 ? (
							services.map((service: any, index: number) => (
							<div
								key={service.title}
								className={cn(
									"relative bg-card border-2 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 group hover:shadow-xl",
									service.popular ? "border-primary shadow-lg" : "border-border"
								)}
							>
								{service.popular && (
									<div className="absolute -top-3 left-6 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold z-10">
										Most Popular
									</div>
								)}

								{/* Banner Image Section */}
								{service.bannerImageUrl && service.bannerImageUrl.trim() !== "" ? (
									<div className="h-48 relative overflow-hidden">
										<img 
											src={service.bannerImageUrl} 
											alt={service.title}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											onError={(e) => {
												// Show fallback design on image error
												e.currentTarget.parentElement!.innerHTML = `
													<div class="w-full h-48 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/20 flex items-center justify-center">
														<div class="text-center">
															<div class="w-16 h-16 mx-auto mb-3 bg-primary/20 rounded-2xl flex items-center justify-center">
																<svg class="w-8 h-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
																</svg>
															</div>
															<p class="text-gray-600 font-medium text-sm px-2">${service.title}</p>
															<p class="text-gray-400 text-xs mt-1">Premium Service</p>
														</div>
													</div>
												`;
											}}
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
										
										{/* Service icon overlay */}
										<div className="absolute top-4 left-4">
											<div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center shadow-lg">
												<service.icon className="w-6 h-6 text-primary" />
											</div>
										</div>
										
										{/* Price overlay */}
										<div className="absolute bottom-4 left-4">
											<div className="text-white">
												<h3 className="text-xl font-bold mb-1">{service.title}</h3>
												<div className="text-2xl font-bold text-white/90">
													{service.price}
												</div>
											</div>
										</div>
									</div>
								) : (
									// Fallback design when no banner image
									<div className="h-48 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/20 flex items-center justify-center relative">
										<div className="text-center">
											<div className="w-16 h-16 mx-auto mb-3 bg-primary/20 rounded-2xl flex items-center justify-center">
												<service.icon className="w-8 h-8 text-primary/60" />
											</div>
											<h3 className="text-gray-600 font-medium text-lg px-2">{service.title}</h3>
											<div className="text-2xl font-bold text-primary mt-2">
												{service.price}
											</div>
										</div>
									</div>
								)}

								{/* Content Section */}
								<div className="p-6">
									<p className="text-muted-foreground mb-6 leading-relaxed">
										{service.description}
									</p>

									<ul className="space-y-3 mb-8">
										{service.features.map((feature: any, featureIndex: number) => (
											<li key={featureIndex} className="flex items-center text-muted-foreground">
												<div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3">
													<div className="w-2 h-2 bg-primary rounded-full" />
												</div>
												{feature}
											</li>
										))}
									</ul>

									<Link to="/book-service/$serviceId" params={{ serviceId: service.id }}>
										<Button
											className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300"
										>
											Book This Service
										</Button>
									</Link>
								</div>
							</div>
						))
						) : (
							// Empty state
							<div className="col-span-full text-center py-16">
								<div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
									<Sparkles className="w-12 h-12 text-muted-foreground" />
								</div>
								<h3 className="text-2xl font-bold text-foreground mb-4">
									No Services Available
								</h3>
								<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
									We're currently setting up our premium services. Please check back soon or contact us for more information.
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
			</div>

			{/* Fleet Showcase */}
			<div className="py-24 bg-beige">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-foreground mb-4">
							Our Premium Fleet
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Experience luxury and comfort with our meticulously maintained fleet
							of premium vehicles, each equipped with modern amenities.
						</p>
					</div>

					<div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
						{carsLoading ? (
							// Loading skeleton for cars
							Array.from({ length: 3 }).map((_, index) => (
								<div key={index} className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border">
									<div className="h-48 bg-muted animate-pulse" />
									<div className="p-6">
										<div className="flex justify-between items-start mb-3">
											<div className="flex-1">
												<div className="h-5 bg-muted rounded w-32 mb-2 animate-pulse" />
												<div className="h-4 bg-muted rounded w-24 animate-pulse" />
											</div>
											<div className="h-4 bg-muted rounded w-16 animate-pulse" />
										</div>
									</div>
								</div>
							))
						) : fleetHighlights.length > 0 ? (
							fleetHighlights.map((vehicle: any, index: number) => (
							<div
								key={vehicle.name}
								className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group border border-border"
							>
								<div className="h-48 bg-muted flex items-center justify-center overflow-hidden">
									{vehicle.image && vehicle.image !== "/images/placeholder-car.jpg" ? (
										<img 
											src={vehicle.image} 
											alt={vehicle.name}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									) : (
										<Car className="w-16 h-16 text-muted-foreground" />
									)}
								</div>

								<div className="p-6">
									<div className="flex justify-between items-start mb-4">
										<div>
											<h3 className="text-xl font-bold text-card-foreground">
												{vehicle.name}
											</h3>
											<p className="text-primary font-semibold">
												{vehicle.type}
											</p>
										</div>
										<div className="text-right">
											<div className="flex items-center text-muted-foreground">
												<Users className="w-4 h-4 mr-1" />
												{vehicle.passengers}
											</div>
										</div>
									</div>
									
									{/* Transparent Pricing */}
									<div className="mb-4 p-3 bg-muted/50 rounded-lg">
										<CarPriceDisplay 
											carId={vehicle.id}
											variant="card"
											className="text-center"
										/>
									</div>
									
									<Link to="/book-car/$carId" params={{ carId: vehicle.id }}>
										<Button
											variant="outline"
											className="w-full border-primary/20 text-primary hover:bg-primary/10 transition-all duration-300"
										>
											Book This Car
										</Button>
									</Link>
								</div>
							</div>
						))
						) : (
							// Empty state for cars
							<div className="col-span-full text-center py-16">
								<div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
									<Car className="w-12 h-12 text-muted-foreground" />
								</div>
								<h3 className="text-2xl font-bold text-foreground mb-4">
									Fleet Coming Soon
								</h3>
								<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
									We're preparing our luxury fleet for you. Please check back soon or contact us for more information.
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
			</div>

			{/* Why Choose Us */}
			<div className="py-24 bg-background">
				<div className="container mx-auto px-6">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						<div>
							<h2 className="text-4xl font-bold text-foreground mb-6">
								Why Choose Down Under Chauffeur?
							</h2>
							<p className="text-xl text-muted-foreground mb-8 leading-relaxed">
								We're not just a transportation service – we're your partners in creating
								exceptional travel experiences that reflect your style and priorities.
							</p>

							<div className="space-y-6">
								{[
									{
										icon: Shield,
										title: "Licensed & Insured",
										description: "Fully licensed chauffeurs with comprehensive insurance coverage for your peace of mind."
									},
									{
										icon: Clock,
										title: "Punctual Service",
										description: "We track flights and traffic to ensure you arrive at your destination on time, every time."
									},
									{
										icon: Star,
										title: "5-Star Experience",
										description: "Premium service quality that has earned us a 5-star rating from over 1000 satisfied clients."
									}
								].map((benefit, index) => (
									<div key={benefit.title} className="flex items-start">
										<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 mt-1">
											<benefit.icon className="w-6 h-6 text-primary" />
										</div>
										<div>
											<h3 className="text-lg font-bold text-foreground mb-2">
												{benefit.title}
											</h3>
											<p className="text-muted-foreground leading-relaxed">
												{benefit.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="relative">
							<div className="aspect-square bg-primary/10 rounded-3xl flex items-center justify-center">
								<Car className="w-32 h-32 text-primary" />
							</div>
							<div className="absolute -bottom-6 -right-6 w-24 h-24 bg-muted rounded-2xl flex items-center justify-center">
								<Sparkles className="w-8 h-8 text-muted-foreground" />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="py-24 bg-primary">
				<div className="container mx-auto px-6 text-center">
					<div className="max-w-3xl mx-auto">
						<h2 className="text-4xl font-bold text-white mb-6">
							Ready to Experience Luxury Transportation?
						</h2>
						<p className="text-xl text-white/80 mb-8 leading-relaxed">
							Book your premium chauffeur service today and discover why discerning
							clients choose Down Under Chauffeur for their transportation needs.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/fleet">
								<Button
									size="lg"
									className="bg-white text-primary hover:bg-beige px-8 py-6 text-lg font-semibold rounded-xl"
								>
									Book Your Journey
								</Button>
							</Link>
							<Link to="/contact-us">
								<Button
									variant="outline"
									size="lg"
									className="border-white/20 text-primary hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl"
								>
									Contact Us
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
