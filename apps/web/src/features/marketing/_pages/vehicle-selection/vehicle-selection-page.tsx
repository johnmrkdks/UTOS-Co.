import { useNavigate, useSearch } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
	ArrowLeft,
	ArrowRight,
	Car,
	Check,
	Filter,
	Fuel,
	Gauge,
	MapPin,
	Search,
	Star,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useGetPublishedCarsQuery } from "@/features/customer/_hooks/query/use-get-published-cars-query";
import { CarPriceDisplay } from "./_components/car-price-display";

export function VehicleSelectionPage() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/_marketing/select-vehicle" });
	const [selectedCarId, setSelectedCarId] = useState<string | null>(
		search.selectedCarId || null,
	);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>(() =>
		search.vehicleCategory && search.vehicleCategory !== ""
			? search.vehicleCategory
			: "all",
	);

	useEffect(() => {
		const v = search.vehicleCategory;
		if (v && v !== "") {
			setCategoryFilter(v);
		}
	}, [search.vehicleCategory]);

	// Fetch published cars
	const { data: carsData, isLoading } = useGetPublishedCarsQuery({ limit: 50 });

	const cars = carsData?.data || [];

	// Filter cars based on search and category
	const filteredCars = cars.filter((car) => {
		const matchesSearch =
			car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			car.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory =
			categoryFilter === "all" || car.category?.name === categoryFilter;
		return matchesSearch && matchesCategory;
	});

	// Get unique categories for filter
	const categories = Array.from(
		new Set(cars.map((car) => car.category?.name).filter(Boolean)),
	);

	const handleContinue = () => {
		if (!selectedCarId) return;

		// Navigate to calculate quote page with selected car
		const params = new URLSearchParams();
		params.set("selectedCarId", selectedCarId);
		if (search.origin) params.set("origin", search.origin);
		if (search.destination) params.set("destination", search.destination);
		if (search.originLat) params.set("originLat", search.originLat);
		if (search.originLng) params.set("originLng", search.originLng);
		if (search.destinationLat)
			params.set("destinationLat", search.destinationLat);
		if (search.destinationLng)
			params.set("destinationLng", search.destinationLng);
		if (search.stops) params.set("stops", search.stops);
		if (search.fromCustomerArea)
			params.set("fromCustomerArea", search.fromCustomerArea);
		if (search.pickupDate) params.set("pickupDate", search.pickupDate);
		if (search.pickupTime) params.set("pickupTime", search.pickupTime);
		if (search.transferType) params.set("transferType", search.transferType);
		if (search.vehicleCategory)
			params.set("vehicleCategory", search.vehicleCategory);

		// Use customer route if coming from customer area
		const calculateQuotePath =
			search.fromCustomerArea === "true"
				? "/dashboard/calculate-quote"
				: "/calculate-quote";

		navigate({
			to: calculateQuotePath,
			search: Object.fromEntries(params) as any,
			resetScroll: true,
		});
	};

	const selectedCar = cars.find((car) => car.id === selectedCarId);

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
					<div className="flex items-center justify-between">
						{/* Mobile - Simpler header */}
						<div className="flex w-full items-center justify-between sm:hidden">
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									navigate({
										to: "/",
										resetScroll: true,
									})
								}
								className="-ml-2 gap-2"
							>
								<ArrowLeft className="h-4 w-4" />
								Back to Quote
							</Button>
						</div>

						{/* Desktop header */}
						<div className="hidden w-full items-center gap-3 sm:flex">
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									navigate({
										to: "/",
										resetScroll: true,
									})
								}
								className="gap-2"
							>
								<ArrowLeft className="h-4 w-4" />
								Back to Quote
							</Button>
							<div className="h-6 w-px bg-border" />
							<div>
								<h1 className="font-semibold text-lg">Choose Your Vehicle</h1>
								<p className="text-muted-foreground text-sm">
									Select from our luxury fleet
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Route Summary (if coming from quote) */}
			{search.origin && search.destination && (
				<div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
					<Card className="border border-gray-200 bg-white shadow-sm">
						<CardContent className="p-3 sm:p-4">
							{/* Mobile - Vertical Stack */}
							<div className="space-y-3 sm:hidden">
								{/* From */}
								<div className="flex items-center gap-2">
									<div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-green-500" />
									<div className="min-w-0 flex-1">
										<div className="mb-0.5 text-gray-500 text-xs">From</div>
										<div className="line-clamp-1 font-medium text-gray-900 text-sm">
											{search.origin}
										</div>
									</div>
								</div>

								{/* To */}
								<div className="flex items-center gap-2">
									<div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500" />
									<div className="min-w-0 flex-1">
										<div className="mb-0.5 text-gray-500 text-xs">To</div>
										<div className="line-clamp-1 font-medium text-gray-900 text-sm">
											{search.destination}
										</div>
									</div>
								</div>
							</div>

							{/* Desktop - Horizontal Layout */}
							<div className="hidden items-center justify-between sm:flex">
								{/* From Section */}
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-3">
										<div className="h-3 w-3 flex-shrink-0 rounded-full bg-green-500" />
										<div className="min-w-0 flex-1">
											<div className="mb-1 text-gray-500 text-xs">From</div>
											<div className="truncate font-medium text-gray-900 text-sm">
												{search.origin}
											</div>
										</div>
									</div>
								</div>

								{/* Route Arrow */}
								<div className="flex flex-shrink-0 items-center px-6">
									<div className="flex items-center gap-1">
										<div className="h-px w-8 bg-gray-300" />
										<ArrowRight className="h-4 w-4 text-gray-400" />
										<div className="h-px w-8 bg-gray-300" />
									</div>
								</div>

								{/* To Section */}
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-3">
										<div className="h-3 w-3 flex-shrink-0 rounded-full bg-red-500" />
										<div className="min-w-0 flex-1">
											<div className="mb-1 text-gray-500 text-xs">To</div>
											<div className="truncate font-medium text-gray-900 text-sm">
												{search.destination}
											</div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Search and Filters */}
			<div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
				<div className="space-y-3 sm:flex sm:gap-4 sm:space-y-0">
					{/* Search */}
					<div className="relative flex-1">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search vehicles..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="h-10 pl-9 text-base" // iOS Safari requires 16px to prevent zoom
							style={{ fontSize: "16px" }} // Explicit font size for iOS
						/>
					</div>

					{/* Category Filter */}
					<div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:pb-0">
						<Button
							variant={categoryFilter === "all" ? "default" : "outline"}
							size="sm"
							onClick={() => setCategoryFilter("all")}
							className="flex-shrink-0"
						>
							All
						</Button>
						{categories.map((category) => (
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
			<div className="mx-auto max-w-7xl px-4 pb-24 sm:pb-28">
				{isLoading ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-64 rounded-xl sm:h-72 lg:h-80" />
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
						{filteredCars.map((car) => (
							<Card
								key={car.id}
								className={`cursor-pointer overflow-hidden border p-0 transition-all duration-300 ${
									selectedCarId === car.id
										? "border-primary/20 bg-primary/5 shadow-lg ring-2 ring-primary"
										: "border-gray-200 hover:shadow-lg sm:hover:scale-[1.02]"
								}`}
								onClick={() => setSelectedCarId(car.id)}
							>
								<div className="relative">
									{/* Car Image */}
									<div className="h-40 overflow-hidden bg-gradient-to-br from-muted to-muted/50 sm:h-40 lg:h-48">
										{car.images && car.images.length > 0 ? (
											<img
												src={
													car.images.find((img: any) => img.isMain)?.url ||
													car.images[0].url
												}
												alt={car.name}
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="flex h-full items-center justify-center">
												<Car className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12 lg:h-16 lg:w-16" />
											</div>
										)}
									</div>

									{/* Selection Indicator */}
									{selectedCarId === car.id && (
										<div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-lg">
											<Check className="h-4 w-4 text-white" />
										</div>
									)}

									{/* Category Badge */}
									<div className="absolute top-3 left-3">
										<Badge
											variant="secondary"
											className="bg-white/90 font-medium text-xs backdrop-blur"
										>
											{car.category?.name}
										</Badge>
									</div>
								</div>

								<CardContent className="p-4">
									<div className="space-y-3">
										{/* Header */}
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0 flex-1">
												<h3 className="font-semibold text-base leading-tight">
													{car.name}
												</h3>
												<p className="text-muted-foreground text-sm">
													{car.model?.name || "Luxury Vehicle"}
												</p>
											</div>
											<CarPriceDisplay
												carId={car.id}
												className="flex-shrink-0 text-right"
											/>
										</div>

										{/* Specs - Optimized for mobile */}
										<div className="grid grid-cols-2 gap-3 text-sm">
											<div className="flex items-center gap-2">
												<Users className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
												<span>{car.seatingCapacity} seats</span>
											</div>
											{car.fuelType && (
												<div className="flex items-center gap-2">
													<Fuel className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
													<span className="truncate">{car.fuelType.name}</span>
												</div>
											)}
											{car.transmissionType && (
												<div className="col-span-2 flex items-center gap-2">
													<Gauge className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
													<span className="truncate">
														{car.transmissionType.name}
													</span>
												</div>
											)}
										</div>

										{/* Features - Mobile optimized */}
										{car.features && car.features.length > 0 && (
											<div className="flex flex-wrap gap-1.5">
												{car.features
													.slice(0, 3)
													.map((feature: any, idx: number) => (
														<Badge
															key={idx}
															variant="outline"
															className="px-2 py-1 text-xs"
														>
															{feature.name}
														</Badge>
													))}
												{car.features.length > 3 && (
													<Badge
														variant="outline"
														className="px-2 py-1 text-xs"
													>
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
					<div className="py-12 text-center">
						<Car className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">No vehicles found</h3>
						<p className="mb-4 text-muted-foreground">
							Try adjusting your search or filters
						</p>
						<Button
							onClick={() => {
								setSearchTerm("");
								setCategoryFilter("all");
							}}
						>
							Clear Filters
						</Button>
					</div>
				)}
			</div>

			{/* Fixed Bottom Action */}
			{selectedCarId && (
				<div className="fixed right-0 bottom-0 left-0 border-t bg-white/95 shadow-lg backdrop-blur">
					<div className="mx-auto max-w-7xl p-4">
						{/* Mobile Layout - Improved */}
						<div className="space-y-4 sm:hidden">
							{selectedCar && (
								<div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
									<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/50">
										{selectedCar.images?.[0] ? (
											<img
												src={
													selectedCar.images.find((img: any) => img.isMain)
														?.url || selectedCar.images[0].url
												}
												alt={selectedCar.name}
												className="h-full w-full object-cover"
											/>
										) : (
											<Car className="h-6 w-6 text-muted-foreground" />
										)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-sm leading-tight">
											{selectedCar.name}
										</p>
										<p className="text-muted-foreground text-xs">
											Selected vehicle
										</p>
									</div>
									<div className="flex-shrink-0">
										<div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
									</div>
								</div>
							)}

							<Button
								onClick={handleContinue}
								className="h-12 w-full gap-2 font-semibold text-base"
							>
								<span>Calculate Quote</span>
								<ArrowRight className="h-5 w-5" />
							</Button>
						</div>

						{/* Desktop Layout - Horizontal */}
						<div className="hidden items-center justify-between gap-4 sm:flex">
							{selectedCar && (
								<div className="flex min-w-0 flex-1 items-center gap-3">
									<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-muted to-muted/50">
										{selectedCar.images?.[0] ? (
											<img
												src={
													selectedCar.images.find((img: any) => img.isMain)
														?.url || selectedCar.images[0].url
												}
												alt={selectedCar.name}
												className="h-full w-full rounded-lg object-cover"
											/>
										) : (
											<Car className="h-6 w-6 text-muted-foreground" />
										)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{selectedCar.name}</p>
										<CarPriceDisplay
											carId={selectedCar.id}
											variant="summary"
											className="text-muted-foreground text-sm"
										/>
									</div>
								</div>
							)}
							<Button onClick={handleContinue} className="gap-2">
								Calculate Quote
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
