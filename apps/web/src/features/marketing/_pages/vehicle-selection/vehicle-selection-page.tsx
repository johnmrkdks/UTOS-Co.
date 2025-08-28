import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useGetPublishedCarsQuery } from "@/features/customer/_hooks/query/use-get-published-cars-query";
import { CarPriceDisplay } from "./_components/car-price-display";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { 
	ArrowLeft, 
	Car, 
	Users, 
	Fuel, 
	Gauge, 
	Star, 
	Search,
	Filter,
	Check,
	ArrowRight,
	MapPin
} from "lucide-react";

export function VehicleSelectionPage() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/_marketing/select-vehicle" });
	const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");

	// Fetch published cars
	const { data: carsData, isLoading } = useGetPublishedCarsQuery({ limit: 50 });

	const cars = carsData?.data || [];

	// Filter cars based on search and category
	const filteredCars = cars.filter(car => {
		const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			car.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = categoryFilter === "all" || car.category?.name === categoryFilter;
		return matchesSearch && matchesCategory;
	});

	// Get unique categories for filter
	const categories = Array.from(new Set(cars.map(car => car.category?.name).filter(Boolean)));

	const handleContinue = () => {
		if (!selectedCarId) return;

		// Navigate to calculate quote page with selected car
		const params = new URLSearchParams();
		params.set("selectedCarId", selectedCarId);
		if (search.origin) params.set("origin", search.origin);
		if (search.destination) params.set("destination", search.destination);
		if (search.originLat) params.set("originLat", search.originLat);
		if (search.originLng) params.set("originLng", search.originLng);
		if (search.destinationLat) params.set("destinationLat", search.destinationLat);
		if (search.destinationLng) params.set("destinationLng", search.destinationLng);
		if (search.stops) params.set("stops", search.stops);

		navigate({ 
			to: "/calculate-quote", 
			search: Object.fromEntries(params) as any
		});
	};

	const selectedCar = cars.find(car => car.id === selectedCarId);

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate({ to: "/" })}
								className="gap-2"
							>
								<ArrowLeft className="w-4 h-4" />
								Back to Quote
							</Button>
							<div className="hidden sm:block h-6 w-px bg-border" />
							<div className="hidden sm:block">
								<h1 className="text-lg font-semibold">Choose Your Vehicle</h1>
								<p className="text-sm text-muted-foreground">Select from our luxury fleet</p>
							</div>
						</div>

						{/* Mobile title */}
						<div className="sm:hidden">
							<h1 className="text-lg font-semibold">Select Vehicle</h1>
						</div>
					</div>
				</div>
			</div>

			{/* Route Summary (if coming from quote) */}
			{search.origin && search.destination && (
				<div className="container mx-auto px-4 py-4">
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
						<CardContent className="p-3 sm:p-4">
							{/* Mobile Route Display - Vertical Stack */}
							<div className="sm:hidden">
								<div className="flex items-center gap-2 mb-2">
									<MapPin className="w-4 h-4 text-primary flex-shrink-0" />
									<span className="text-xs font-medium text-muted-foreground">Your Route</span>
								</div>
								
								<div className="space-y-3">
									{/* Origin */}
									<div className="flex items-start gap-3">
										<div className="relative mt-0.5">
											<div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm flex-shrink-0" />
											<div className="absolute left-1/2 top-3 w-px h-4 bg-gradient-to-b from-green-500 to-red-500 transform -translate-x-1/2"></div>
										</div>
										<div className="flex-1 min-w-0">
											<div className="text-xs text-muted-foreground">From</div>
											<div className="font-medium text-sm leading-tight break-words">{search.origin}</div>
										</div>
									</div>
									
									{/* Destination */}
									<div className="flex items-start gap-3">
										<div className="relative mt-0.5">
											<div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm flex-shrink-0" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="text-xs text-muted-foreground">To</div>
											<div className="font-medium text-sm leading-tight break-words">{search.destination}</div>
										</div>
									</div>
								</div>
								
								<div className="mt-3 pt-2 border-t border-primary/10">
									<div className="text-center text-xs text-muted-foreground">
										Choose your vehicle below
									</div>
								</div>
							</div>

							{/* Desktop Route Display - Horizontal Layout */}
							<div className="hidden sm:flex items-center gap-4">
								{/* Route Visual */}
								<div className="flex items-center gap-3 flex-1 min-w-0">
									{/* Origin */}
									<div className="flex items-center gap-2 flex-1 min-w-0">
										<div className="relative">
											<div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm flex-shrink-0" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="text-xs text-muted-foreground">From</div>
											<div className="font-medium text-sm truncate">{search.origin}</div>
										</div>
									</div>

									{/* Route Line with Direction */}
									<div className="flex items-center gap-1 px-2 flex-shrink-0">
										<div className="w-6 h-px bg-gradient-to-r from-green-500 to-red-500" />
										<div className="w-2 h-2 border-t-2 border-r-2 border-red-500 transform rotate-45" />
									</div>

									{/* Destination */}
									<div className="flex items-center gap-2 flex-1 min-w-0">
										<div className="relative">
											<div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm flex-shrink-0" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="text-xs text-muted-foreground">To</div>
											<div className="font-medium text-sm truncate">{search.destination}</div>
										</div>
									</div>
								</div>

								{/* Route Icon */}
								<div className="flex-shrink-0">
									<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
										<MapPin className="w-4 h-4 text-primary" />
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Search and Filters */}
			<div className="container mx-auto px-4 py-4">
				<div className="flex flex-col sm:flex-row gap-4 mb-6">
					{/* Search */}
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							placeholder="Search vehicles..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9"
						/>
					</div>

					{/* Category Filter */}
					<div className="flex gap-2 flex-wrap">
						<Button
							variant={categoryFilter === "all" ? "default" : "outline"}
							size="sm"
							onClick={() => setCategoryFilter("all")}
						>
							All
						</Button>
						{categories.map(category => (
							<Button
								key={category}
								variant={categoryFilter === category ? "default" : "outline"}
								size="sm"
								onClick={() => setCategoryFilter(category!)}
							>
								{category}
							</Button>
						))}
					</div>
				</div>
			</div>

			{/* Vehicle Grid */}
			<div className="container mx-auto px-4 pb-24">
				{isLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-64 sm:h-72 lg:h-80 rounded-xl" />
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
						{filteredCars.map((car) => (
							<Card
								key={car.id}
								className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
									selectedCarId === car.id
										? "ring-2 ring-primary shadow-lg bg-primary/5"
										: "sm:hover:scale-[1.02]"
								}`}
								onClick={() => setSelectedCarId(car.id)}
							>
								<div className="relative">
									{/* Car Image */}
									<div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg overflow-hidden">
										{car.images && car.images.length > 0 ? (
											<img
												src={car.images.find(img => img.isMain)?.url || car.images[0].url}
												alt={car.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="flex items-center justify-center h-full">
												<Car className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-muted-foreground" />
											</div>
										)}
									</div>

									{/* Selection Indicator */}
									{selectedCarId === car.id && (
										<div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
											<Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
										</div>
									)}

									{/* Category Badge */}
									<div className="absolute top-2 left-2 sm:top-4 sm:left-4">
										<Badge variant="secondary" className="bg-white/90 backdrop-blur text-xs">
											{car.category?.name}
										</Badge>
									</div>
								</div>

								<CardContent className="p-3 sm:p-4 lg:p-6">
									<div className="space-y-2 sm:space-y-3 lg:space-y-4">
										{/* Header */}
										<div className="flex justify-between items-start gap-2">
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate">{car.name}</h3>
												<p className="text-muted-foreground text-xs sm:text-sm truncate">{car.model?.name || 'Luxury Vehicle'}</p>
											</div>
											<CarPriceDisplay 
												carId={car.id}
												className="text-right flex-shrink-0"
											/>
										</div>

										{/* Specs */}
										<div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
											<div className="flex items-center gap-1.5 sm:gap-2">
												<Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
												<span className="truncate">{car.seatingCapacity} seats</span>
											</div>
											{car.fuelType && (
												<div className="flex items-center gap-1.5 sm:gap-2">
													<Fuel className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
													<span className="truncate">{car.fuelType.name}</span>
												</div>
											)}
											{car.transmissionType && (
												<div className="flex items-center gap-1.5 sm:gap-2 col-span-2 sm:col-span-1">
													<Gauge className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
													<span className="truncate">{car.transmissionType.name}</span>
												</div>
											)}
										</div>

										{/* Features - Show fewer on mobile */}
										{car.features && car.features.length > 0 && (
											<div>
												<div className="flex flex-wrap gap-1">
													{/* Show 2 features on mobile, 3 on larger screens */}
													<div className="sm:hidden">
														{car.features.slice(0, 2).map((feature, idx) => (
															<Badge key={idx} variant="outline" className="text-xs">
																{feature.name}
															</Badge>
														))}
														{car.features.length > 2 && (
															<Badge variant="outline" className="text-xs">
																+{car.features.length - 2} more
															</Badge>
														)}
													</div>
													<div className="hidden sm:flex sm:flex-wrap sm:gap-1">
														{car.features.slice(0, 3).map((feature, idx) => (
															<Badge key={idx} variant="outline" className="text-xs">
																{feature.name}
															</Badge>
														))}
														{car.features.length > 3 && (
															<Badge variant="outline" className="text-xs">
																+{car.features.length - 3} more
															</Badge>
														)}
													</div>
												</div>
											</div>
										)}

										{/* Description - Hidden on mobile for space */}
										{car.description && (
											<p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block">
												{car.description}
											</p>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* No Results */}
				{!isLoading && filteredCars.length === 0 && (
					<div className="text-center py-12">
						<Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
						<p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
						<Button onClick={() => { setSearchTerm(""); setCategoryFilter("all"); }}>
							Clear Filters
						</Button>
					</div>
				)}
			</div>

			{/* Fixed Bottom Action */}
			{selectedCarId && (
				<div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
					<div className="container mx-auto p-4">
						{/* Mobile Layout - Stacked */}
						<div className="sm:hidden space-y-3">
							{selectedCar && (
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
										{selectedCar.images?.[0] ? (
											<img
												src={selectedCar.images.find(img => img.isMain)?.url || selectedCar.images[0].url}
												alt={selectedCar.name}
												className="w-full h-full object-cover rounded-lg"
											/>
										) : (
											<Car className="w-5 h-5 text-muted-foreground" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sm leading-tight break-words">{selectedCar.name}</p>
										<p className="text-xs text-muted-foreground">Selected vehicle</p>
									</div>
									<div className="flex-shrink-0">
										<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
									</div>
								</div>
							)}
							
							<Button onClick={handleContinue} className="w-full gap-2 h-11">
								<span>Calculate Quote</span>
								<ArrowRight className="w-4 h-4" />
							</Button>
						</div>

						{/* Desktop Layout - Horizontal */}
						<div className="hidden sm:flex items-center justify-between gap-4">
							{selectedCar && (
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<div className="w-12 h-12 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
										{selectedCar.images?.[0] ? (
											<img
												src={selectedCar.images.find(img => img.isMain)?.url || selectedCar.images[0].url}
												alt={selectedCar.name}
												className="w-full h-full object-cover rounded-lg"
											/>
										) : (
											<Car className="w-6 h-6 text-muted-foreground" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium truncate">{selectedCar.name}</p>
										<CarPriceDisplay 
											carId={selectedCar.id}
											variant="summary"
											className="text-sm text-muted-foreground"
										/>
									</div>
								</div>
							)}
							<Button onClick={handleContinue} className="gap-2">
								Calculate Quote
								<ArrowRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}