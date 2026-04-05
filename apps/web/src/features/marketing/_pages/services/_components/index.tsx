import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	Building,
	Calendar,
	Car,
	Clock,
	MapPin,
	Plane,
	Shield,
	Sparkles,
	Star,
	Users,
} from "lucide-react";
import { CarPriceDisplay } from "@/features/marketing/_pages/vehicle-selection/_components/car-price-display";
import { useGetPublishedCarsQuery } from "../_hooks/query/use-get-published-cars-query";
import { useGetPublishedPackagesQuery } from "../_hooks/query/use-get-published-packages-query";

// Service type to icon mapping
const serviceIcons: Record<string, any> = {
	transfer: Plane,
	tour: MapPin,
	event: Sparkles,
	hourly: Calendar,
	corporate: Building,
	vip: Users,
};

type ServicesProps = {
	className?: string;
};

export function Services({ className, ...props }: ServicesProps) {
	// Fetch published packages - show all available services
	const { data: packagesData, isLoading: packagesLoading } =
		useGetPublishedPackagesQuery({
			limit: 50, // Increased to show more services
		});

	// Fetch published cars for fleet showcase
	const { data: carsData, isLoading: carsLoading } = useGetPublishedCarsQuery({
		limit: 12, // Increased to show more cars in fleet section
	});

	const services =
		packagesData?.data?.map((pkg: any) => {
			// Helper function to get the correct price display
			const getPriceDisplay = () => {
				const rateType = pkg.packageServiceType?.rateType;

				if (rateType === "hourly" && pkg.hourlyRate) {
					return `From $${pkg.hourlyRate.toFixed(2)}/hr`;
				}
				if (rateType === "fixed" && pkg.fixedPrice) {
					return `From $${pkg.fixedPrice.toFixed(2)}`;
				}
				// Fallback logic
				if (pkg.hourlyRate && pkg.hourlyRate > 0) {
					return `From $${pkg.hourlyRate.toFixed(2)}/hr`;
				}
				if (pkg.fixedPrice && pkg.fixedPrice > 0) {
					return `From $${pkg.fixedPrice.toFixed(2)}`;
				}
				return "Contact for Price";
			};

			return {
				id: pkg.id,
				icon: serviceIcons[pkg.serviceType] || Building,
				title: pkg.name,
				description: pkg.description,
				bannerImageUrl: pkg.bannerImageUrl,
				features: [],
				price: getPriceDisplay(),
				popular: pkg.serviceType === "transfer", // Mark airport transfers as popular
			};
		}) || [];

	const fleetHighlights =
		carsData?.data?.map((car: any) => ({
			id: car.id,
			name: car.name,
			type: car.category?.name || "Luxury Vehicle",
			passengers: `1-${car.seatingCapacity}`,
			image:
				car.images?.find((img: any) => img.isMain)?.url ||
				"/images/placeholder-car.jpg",
		})) || [];
	return (
		<div className={cn("", className)} {...props}>
			{/* Services Grid */}
			<div className="bg-background py-24">
				<div className="container mx-auto px-6">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-4xl text-foreground">
							Our Premium Services
						</h2>
						<p className="mx-auto max-w-3xl text-muted-foreground text-xl">
							Choose from our comprehensive range of luxury transportation
							services, each designed to exceed your expectations.
						</p>
					</div>

					<div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{packagesLoading ? (
							// Loading skeleton
							Array.from({ length: 6 }).map((_, index) => (
								<div
									key={index}
									className="rounded-2xl border-2 border-border bg-card p-8"
								>
									<div className="mb-6 flex items-center">
										<div className="mr-4 h-14 w-14 animate-pulse rounded-2xl bg-muted" />
										<div>
											<div className="mb-2 h-5 w-32 animate-pulse rounded bg-muted" />
											<div className="h-6 w-20 animate-pulse rounded bg-muted" />
										</div>
									</div>
									<div className="mb-2 h-4 w-full animate-pulse rounded bg-muted" />
									<div className="mb-6 h-4 w-3/4 animate-pulse rounded bg-muted" />
									<div className="mb-8 space-y-3">
										{Array.from({ length: 4 }).map((_, i) => (
											<div
												key={i}
												className="h-4 w-5/6 animate-pulse rounded bg-muted"
											/>
										))}
									</div>
									<div className="h-12 animate-pulse rounded bg-muted" />
								</div>
							))
						) : services.length > 0 ? (
							services.map((service: any, index: number) => (
								<div
									key={service.title}
									className={cn(
										"group relative overflow-hidden rounded-2xl border-2 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl",
										service.popular
											? "border-primary shadow-lg"
											: "border-border",
									)}
								>
									{service.popular && (
										<div className="-top-3 absolute left-6 z-10 rounded-full bg-primary px-4 py-1 font-semibold text-primary-foreground text-sm">
											Most Popular
										</div>
									)}

									{/* Banner Image Section */}
									{service.bannerImageUrl &&
									service.bannerImageUrl.trim() !== "" ? (
										<div className="relative h-48 overflow-hidden">
											<img
												src={service.bannerImageUrl}
												alt={service.title}
												className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
												<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 shadow-lg">
													<service.icon className="h-6 w-6 text-primary" />
												</div>
											</div>

											{/* Price overlay */}
											<div className="absolute bottom-4 left-4">
												<div className="text-white">
													<h3 className="mb-1 font-bold text-xl">
														{service.title}
													</h3>
													<div className="font-bold text-2xl text-white/90">
														{service.price}
													</div>
												</div>
											</div>
										</div>
									) : (
										// Fallback design when no banner image
										<div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/20">
											<div className="text-center">
												<div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
													<service.icon className="h-8 w-8 text-primary/60" />
												</div>
												<h3 className="px-2 font-medium text-gray-600 text-lg">
													{service.title}
												</h3>
												<div className="mt-2 font-bold text-2xl text-primary">
													{service.price}
												</div>
											</div>
										</div>
									)}

									{/* Content Section */}
									<div className="p-6">
										<p className="mb-6 text-muted-foreground leading-relaxed">
											{service.description}
										</p>

										{service.features.length > 0 && (
											<ul className="mb-8 space-y-3">
												{service.features.map(
													(feature: any, featureIndex: number) => (
														<li
															key={featureIndex}
															className="flex items-center text-muted-foreground"
														>
															<div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
																<div className="h-2 w-2 rounded-full bg-primary" />
															</div>
															{feature}
														</li>
													),
												)}
											</ul>
										)}

										<Link
											to="/book-service/$serviceId"
											params={{ serviceId: service.id }}
										>
											<Button className="w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90">
												Book This Service
											</Button>
										</Link>
									</div>
								</div>
							))
						) : (
							// Empty state
							<div className="col-span-full py-16 text-center">
								<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-muted">
									<Sparkles className="h-12 w-12 text-muted-foreground" />
								</div>
								<h3 className="mb-4 font-bold text-2xl text-foreground">
									No Services Available
								</h3>
								<p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
									We're currently setting up our premium services. Please check
									back soon or contact us for more information.
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
			<div className="bg-beige py-24">
				<div className="container mx-auto px-6">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-4xl text-foreground">
							Our Premium Fleet
						</h2>
						<p className="mx-auto max-w-3xl text-muted-foreground text-xl">
							Experience luxury and comfort with our meticulously maintained
							fleet of premium vehicles, each equipped with modern amenities.
						</p>
					</div>

					<div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{carsLoading ? (
							// Loading skeleton for cars
							Array.from({ length: 3 }).map((_, index) => (
								<div
									key={index}
									className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
								>
									<div className="h-48 animate-pulse bg-muted" />
									<div className="p-6">
										<div className="mb-3 flex items-start justify-between">
											<div className="flex-1">
												<div className="mb-2 h-5 w-32 animate-pulse rounded bg-muted" />
												<div className="h-4 w-24 animate-pulse rounded bg-muted" />
											</div>
											<div className="h-4 w-16 animate-pulse rounded bg-muted" />
										</div>
									</div>
								</div>
							))
						) : fleetHighlights.length > 0 ? (
							fleetHighlights.map((vehicle: any, index: number) => (
								<div
									key={vehicle.name}
									className="group overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
								>
									<div className="flex h-48 items-center justify-center overflow-hidden bg-muted">
										{vehicle.image &&
										vehicle.image !== "/images/placeholder-car.jpg" ? (
											<img
												src={vehicle.image}
												alt={vehicle.name}
												className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
											/>
										) : (
											<Car className="h-16 w-16 text-muted-foreground" />
										)}
									</div>

									<div className="p-6">
										<div className="mb-4 flex items-start justify-between">
											<div>
												<h3 className="font-bold text-card-foreground text-xl">
													{vehicle.name}
												</h3>
												<p className="font-semibold text-primary">
													{vehicle.type}
												</p>
											</div>
											<div className="text-right">
												<div className="flex items-center text-muted-foreground">
													<Users className="mr-1 h-4 w-4" />
													{vehicle.passengers}
												</div>
											</div>
										</div>

										{/* Transparent Pricing */}
										<div className="mb-4 rounded-lg bg-muted/50 p-3">
											<CarPriceDisplay
												carId={vehicle.id}
												variant="card"
												className="text-center"
											/>
										</div>

										<Link
											to="/calculate-quote"
											search={{ selectedCarId: vehicle.id }}
										>
											<Button
												variant="outline"
												className="w-full border-primary/20 text-primary transition-all duration-300 hover:bg-primary/10"
											>
												Book This Car
											</Button>
										</Link>
									</div>
								</div>
							))
						) : (
							// Empty state for cars
							<div className="col-span-full py-16 text-center">
								<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-muted">
									<Car className="h-12 w-12 text-muted-foreground" />
								</div>
								<h3 className="mb-4 font-bold text-2xl text-foreground">
									Fleet Coming Soon
								</h3>
								<p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
									We're preparing our luxury fleet for you. Please check back
									soon or contact us for more information.
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
			<div className="bg-background py-24">
				<div className="container mx-auto px-6">
					<div className="grid items-center gap-16 lg:grid-cols-2">
						<div>
							<h2 className="mb-6 font-bold text-4xl text-foreground">
								Why Choose Utos & Co.?
							</h2>
							<p className="mb-8 text-muted-foreground text-xl leading-relaxed">
								We're not just a transportation service – we're your partners in
								creating exceptional travel experiences that reflect your style
								and priorities.
							</p>

							<div className="space-y-6">
								{[
									{
										icon: Shield,
										title: "Licensed & Insured",
										description:
											"Fully licensed chauffeurs with comprehensive insurance coverage for your peace of mind.",
									},
									{
										icon: Clock,
										title: "Punctual Service",
										description:
											"We track flights and traffic to ensure you arrive at your destination on time, every time.",
									},
									{
										icon: Star,
										title: "5-Star Experience",
										description:
											"Premium service quality that has earned us a 5-star rating from over 1000 satisfied clients.",
									},
								].map((benefit, index) => (
									<div key={benefit.title} className="flex items-start">
										<div className="mt-1 mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
											<benefit.icon className="h-6 w-6 text-primary" />
										</div>
										<div>
											<h3 className="mb-2 font-bold text-foreground text-lg">
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
							<div className="flex aspect-square items-center justify-center rounded-3xl bg-primary/10">
								<Car className="h-32 w-32 text-primary" />
							</div>
							<div className="-bottom-6 -right-6 absolute flex h-24 w-24 items-center justify-center rounded-2xl bg-muted">
								<Sparkles className="h-8 w-8 text-muted-foreground" />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-primary py-24">
				<div className="container mx-auto px-6 text-center">
					<div className="mx-auto max-w-3xl">
						<h2 className="mb-6 font-bold text-4xl text-white">
							Ready to Experience Luxury Transportation?
						</h2>
						<p className="mb-8 text-white/80 text-xl leading-relaxed">
							Book your premium chauffeur service today and discover why
							discerning clients choose Utos & Co. for their transportation
							needs.
						</p>

						<div className="flex flex-col justify-center gap-4 sm:flex-row">
							<Link to="/fleet">
								<Button
									size="lg"
									className="rounded-xl bg-white px-8 py-6 font-semibold text-lg text-primary hover:bg-beige"
								>
									Book Your Journey
								</Button>
							</Link>
							<Link to="/contact-us">
								<Button
									variant="outline"
									size="lg"
									className="rounded-xl border-white/20 px-8 py-6 font-semibold text-lg text-primary hover:bg-white/10"
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
