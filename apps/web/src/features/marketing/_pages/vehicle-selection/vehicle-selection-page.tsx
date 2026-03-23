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
	const [selectedCarId, setSelectedCarId] = useState<string | null>(search.selectedCarId || null);
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
		if (search.fromCustomerArea) params.set("fromCustomerArea", search.fromCustomerArea);

		// Use customer route if coming from customer area
		const calculateQuotePath = search.fromCustomerArea === "true" 
			? "/dashboard/calculate-quote" 
			: "/calculate-quote";
		
		navigate({
			to: calculateQuotePath,
			search: Object.fromEntries(params) as any,
			resetScroll: true
		});
	};

	const selectedCar = cars.find(car => car.id === selectedCarId);

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
				<div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
					<div className="flex items-center justify-between">
						{/* Mobile - Simpler header */}
						<div className="sm:hidden flex items-center justify-between w-full">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate({
									to: "/",
									resetScroll: true
								})}
								className="gap-2 -ml-2"
							>
								<ArrowLeft className="w-4 h-4" />
								Back to Quote
							</Button>
						</div>

						{/* Desktop header */}
						<div className="hidden sm:flex items-center gap-3 w-full">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate({
									to: "/",
									resetScroll: true
								})}
								className="gap-2"
							>
								<ArrowLeft className="w-4 h-4" />
								Back to Quote
							</Button>
							<div className="h-6 w-px bg-border" />
							<div>
								<h1 className="text-lg font-semibold">Choose Your Vehicle</h1>
								<p className="text-sm text-muted-foreground">Select from our luxury fleet</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Route Summary (if coming from quote) */}
			{search.origin && search.destination && (
				<div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
					<Card className="bg-white border border-gray-200 shadow-sm">
						<CardContent className="p-3 sm:p-4">
							{/* Mobile - Vertical Stack */}
							<div className="sm:hidden space-y-3">
								{/* From */}
								<div className="flex items-center gap-2">
									<div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<div className="text-xs text-gray-500 mb-0.5">From</div>
										<div className="font-medium text-sm text-gray-900 line-clamp-1">{search.origin}</div>
									</div>
								</div>
								
								{/* To */}
								<div className="flex items-center gap-2">
									<div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<div className="text-xs text-gray-500 mb-0.5">To</div>
										<div className="font-medium text-sm text-gray-900 line-clamp-1">{search.destination}</div>
									</div>
								</div>
							</div>

							{/* Desktop - Horizontal Layout */}
							<div className="hidden sm:flex items-center justify-between">
								{/* From Section */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-3">
										<div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<div className="text-xs text-gray-500 mb-1">From</div>
											<div className="font-medium text-sm text-gray-900 truncate">{search.origin}</div>
										</div>
									</div>
								</div>

								{/* Route Arrow */}
								<div className="flex items-center px-6 flex-shrink-0">
									<div className="flex items-center gap-1">
										<div className="w-8 h-px bg-gray-300" />
										<ArrowRight className="w-4 h-4 text-gray-400" />
										<div className="w-8 h-px bg-gray-300" />
									</div>
								</div>

								{/* To Section */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-3">
										<div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<div className="text-xs text-gray-500 mb-1">To</div>
											<div className="font-medium text-sm text-gray-900 truncate">{search.destination}</div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Search and Filters */}
			<div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
				<div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
					{/* Search */}
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							placeholder="Search vehicles..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9 h-10 text-base" // iOS Safari requires 16px to prevent zoom
							style={{ fontSize: '16px' }} // Explicit font size for iOS
						/>
					</div>

					{/* Category Filter */}
					<div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap">
						<Button
							variant={categoryFilter === "all" ? "default" : "outline"}
							size="sm"
							onClick={() => setCategoryFilter("all")}
							className="flex-shrink-0"
						>
							All
						</Button>
						{categories.map(category => (
							<Button
								key={category}
								variant={categoryFilter === category ? "default" : "outline"}
								size="sm"
								onClick={() => setCategoryFilter(category!)}
								className="flex-shrink-0"
							>
								{category}
							</Button>
						))}
					</div>
				</div>
			</div>

			{/* Vehicle Grid */}
			<div className="max-w-7xl mx-auto px-4 pb-24 sm:pb-28">
				{isLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-64 sm:h-72 lg:h-80 rounded-xl" />
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						{filteredCars.map((car) => (
							<Card
								key={car.id}
								className={`cursor-pointer transition-all duration-300 overflow-hidden p-0 border ${
									selectedCarId === car.id
										? "ring-2 ring-primary shadow-lg bg-primary/5 border-primary/20"
										: "border-gray-200 hover:shadow-lg sm:hover:scale-[1.02]"
								}`}
								onClick={() => setSelectedCarId(car.id)}
							>
								<div className="relative">
									{/* Car Image */}
									<div className="h-40 sm:h-40 lg:h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
										{car.images && car.images.length > 0 ? (
											<img
												src={car.images.find((img: any) => img.isMain)?.url || car.images[0].url}
												alt={car.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="flex items-center justify-center h-full">
												<Car className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-muted-foreground" />
											</div>
										)}
									</div>

									{/* Selection Indicator */}
									{selectedCarId === car.id && (
										<div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg">
											<Check className="w-4 h-4 text-white" />
										</div>
									)}

									{/* Category Badge */}
									<div className="absolute top-3 left-3">
										<Badge variant="secondary" className="bg-white/90 backdrop-blur text-xs font-medium">
											{car.category?.name}
										</Badge>
									</div>
								</div>

								<CardContent className="p-4">
									<div className="space-y-3">
										{/* Header */}
										<div className="flex justify-between items-start gap-2">
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-base leading-tight">{car.name}</h3>
												<p className="text-muted-foreground text-sm">{car.model?.name || 'Luxury Vehicle'}</p>
											</div>
											<CarPriceDisplay 
												carId={car.id}
												className="text-right flex-shrink-0"
											/>
										</div>

										{/* Specs - Optimized for mobile */}
										<div className="grid grid-cols-2 gap-3 text-sm">
											<div className="flex items-center gap-2">
												<Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
												<span>{car.seatingCapacity} seats</span>
											</div>
											{car.fuelType && (
												<div className="flex items-center gap-2">
													<Fuel className="w-4 h-4 text-muted-foreground flex-shrink-0" />
													<span className="truncate">{car.fuelType.name}</span>
												</div>
											)}
											{car.transmissionType && (
												<div className="flex items-center gap-2 col-span-2">
													<Gauge className="w-4 h-4 text-muted-foreground flex-shrink-0" />
													<span className="truncate">{car.transmissionType.name}</span>
												</div>
											)}
										</div>

										{/* Features - Mobile optimized */}
										{car.features && car.features.length > 0 && (
											<div className="flex flex-wrap gap-1.5">
												{car.features.slice(0, 3).map((feature: any, idx: number) => (
													<Badge key={idx} variant="outline" className="text-xs px-2 py-1">
														{feature.name}
													</Badge>
												))}
												{car.features.length > 3 && (
													<Badge variant="outline" className="text-xs px-2 py-1">
														+{car.features.length - 3} more
													</Badge>
												)}
											</div>
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
				<div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t shadow-lg">
					<div className="max-w-7xl mx-auto p-4">
						{/* Mobile Layout - Improved */}
						<div className="sm:hidden space-y-4">
							{selectedCar && (
								<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
									<div className="w-12 h-12 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
										{selectedCar.images?.[0] ? (
											<img
												src={selectedCar.images.find((img: any) => img.isMain)?.url || selectedCar.images[0].url}
												alt={selectedCar.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<Car className="w-6 h-6 text-muted-foreground" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-sm leading-tight">{selectedCar.name}</p>
										<p className="text-xs text-muted-foreground">Selected vehicle</p>
									</div>
									<div className="flex-shrink-0">
										<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
									</div>
								</div>
							)}
							
							<Button onClick={handleContinue} className="w-full gap-2 h-12 text-base font-semibold">
								<span>Calculate Quote</span>
								<ArrowRight className="w-5 h-5" />
							</Button>
						</div>

						{/* Desktop Layout - Horizontal */}
						<div className="hidden sm:flex items-center justify-between gap-4">
							{selectedCar && (
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<div className="w-12 h-12 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
										{selectedCar.images?.[0] ? (
											<img
												src={selectedCar.images.find((img: any) => img.isMain)?.url || selectedCar.images[0].url}
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