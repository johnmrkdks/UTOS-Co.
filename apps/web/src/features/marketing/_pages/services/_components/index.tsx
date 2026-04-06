import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Car, Clock, Shield, Sparkles, Star, Users } from "lucide-react";
import servicesFleetHero from "@/assets/marketing/services-official-transport-fleet.png";
import { Logo } from "@/components/logo";
import { CarPriceDisplay } from "@/features/marketing/_pages/vehicle-selection/_components/car-price-display";
import { useGetPublishedCarsQuery } from "../_hooks/query/use-get-published-cars-query";
import { useGetPublishedPackagesQuery } from "../_hooks/query/use-get-published-packages-query";

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
			{/* Hero — official fleet */}
			<div
				className="relative bg-[center_65%] bg-cover bg-no-repeat py-20 md:py-28"
				style={{ backgroundImage: `url(${servicesFleetHero})` }}
			>
				<div className="absolute inset-0 bg-gradient-to-br from-stone-950/90 via-stone-900/78 to-stone-950/88" />
				<div className="container relative z-10 mx-auto px-6 text-center">
					<div className="mx-auto max-w-2xl">
						<p className="mb-3 font-medium text-[0.65rem] text-primary-secondary/95 uppercase tracking-[0.22em]">
							Services
						</p>
						<h1 className="mb-4 font-semibold text-3xl text-white tracking-tight md:text-4xl lg:text-5xl">
							How we can drive you
						</h1>
						<p className="mx-auto text-base text-white/80 leading-relaxed md:text-lg">
							Transfers, hourly hire, events, and corporate travel — licensed
							chauffeurs and a maintained fleet.
						</p>
					</div>
				</div>
			</div>

			{/* Services Grid */}
			<div className="bg-background py-16 md:py-24">
				<div className="container mx-auto px-6">
					<div className="mb-12 text-center md:mb-16">
						<h2 className="mb-3 font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
							Offerings
						</h2>
						<p className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
							Pick a service — pricing shown where available.
						</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{packagesLoading ? (
							// Loading skeleton
							Array.from({ length: 6 }).map((_, index) => (
								<div
									key={index}
									className="rounded-xl border border-border/60 bg-card p-6"
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
										"group relative overflow-hidden rounded-xl border border-border/60 bg-card transition-colors hover:border-border",
										service.popular ? "ring-1 ring-border/80" : "",
									)}
								>
									{service.popular && (
										<div className="-top-px absolute left-4 z-10 rounded-b-md bg-foreground px-3 py-1 font-medium text-background text-xs">
											Popular
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

											{/* Company logo */}
											<div className="absolute top-4 left-4">
												<div
													className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 p-1.5 shadow-lg"
													aria-hidden
												>
													<Logo className="h-full max-h-8 w-auto max-w-[52px] object-contain object-center" />
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
												<div
													className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 p-2"
													aria-hidden
												>
													<Logo className="h-full max-h-10 w-auto max-w-[72px] object-contain object-center" />
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
											<Button className="h-10 w-full rounded-md font-medium">
												Book
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
			<div className="bg-muted/20 py-16 md:py-24">
				<div className="container mx-auto px-6">
					<div className="mb-12 text-center md:mb-16">
						<h2 className="mb-3 font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
							Fleet snapshot
						</h2>
						<p className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
							A selection of vehicles — book for a tailored quote.
						</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{carsLoading ? (
							// Loading skeleton for cars
							Array.from({ length: 3 }).map((_, index) => (
								<div
									key={index}
									className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-none"
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
									className="group overflow-hidden rounded-xl border border-border/60 bg-card shadow-none transition-colors hover:border-border"
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
												className="h-10 w-full rounded-md"
											>
												Quote this vehicle
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
			<div className="bg-background py-16 md:py-24">
				<div className="container mx-auto px-6">
					<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
						<div>
							<h2 className="mb-4 font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
								Why Utos & Co.
							</h2>
							<p className="mb-8 text-base text-muted-foreground leading-relaxed md:text-lg">
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
										<div className="mt-0.5 mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60">
											<benefit.icon className="h-5 w-5 text-foreground/80" />
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
							<div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border/50 shadow-none">
								<img
									src={servicesFleetHero}
									alt="UTOS & Co. luxury fleet — official transport"
									className="h-full w-full object-cover object-center"
								/>
								<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
							</div>
							<div className="-bottom-4 -right-4 absolute flex h-14 w-14 items-center justify-center rounded-xl border border-border/60 bg-background">
								<Sparkles className="h-6 w-6 text-muted-foreground" />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-primary py-16 md:py-24">
				<div className="container mx-auto px-6 text-center">
					<div className="mx-auto max-w-2xl">
						<h2 className="mb-4 font-semibold text-2xl text-white tracking-tight md:text-3xl">
							Ready when you are
						</h2>
						<p className="mb-8 text-base text-white/85 leading-relaxed md:text-lg">
							Book your premium chauffeur service today and discover why
							discerning clients choose Utos & Co. for their transportation
							needs.
						</p>

						<div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
							<Link to="/fleet">
								<Button
									size="lg"
									className="h-12 rounded-md bg-white px-8 font-medium text-primary hover:bg-white/95"
								>
									View fleet
								</Button>
							</Link>
							<Link to="/contact-us">
								<Button
									variant="outline"
									size="lg"
									className="h-12 rounded-md border-white/35 bg-transparent px-8 font-medium text-white hover:bg-white/10"
								>
									Contact
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
