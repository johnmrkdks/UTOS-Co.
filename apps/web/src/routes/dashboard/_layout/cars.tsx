import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Search, Filter, Car, Calendar, Users, MapPin, Star, Clock, Fuel, Settings, Eye, Briefcase } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Separator } from "@workspace/ui/components/separator"
import { useGetPublishedCarsQuery } from "@/features/customer/_hooks/query/use-get-published-cars-query"
import { CarPriceDisplay } from "@/features/marketing/_pages/vehicle-selection/_components/car-price-display"

export const Route = createFileRoute("/dashboard/_layout/cars")({
	component: CustomerCarsPage,
})

function CustomerCarsPage() {
	const navigate = useNavigate()
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

	const { data: carsData, isLoading: carsLoading, error: carsError } = useGetPublishedCarsQuery({
		limit: 20,
		offset: 0,
	})

	// Handle different data formats - might be wrapped in items or direct array
	const cars = Array.isArray(carsData) ? carsData : (carsData?.data || [])

	// Extract unique categories from cars for filtering
	const uniqueCategories = cars.reduce((acc: any[], car: any) => {
		if (car.category && !acc.find(cat => cat.id === car.category.id)) {
			acc.push(car.category)
		}
		return acc
	}, [])

	// Debug logging
	console.log("Raw cars data:", carsData)
	console.log("Processed cars:", cars)
	console.log("Cars error:", carsError)
	console.log("Cars count:", cars.length)
	if (cars.length > 0) {
		console.log("First car:", cars[0])
	}

	// Filter cars based on search and category
	const filteredCars = cars.filter((car: any) => {
		const matchesSearch = !searchQuery || 
			car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			car.model?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			car.model?.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase())
		
		const matchesCategory = !selectedCategory || car.categoryId === selectedCategory
		
		return matchesSearch && matchesCategory
	})

	const handleBookAppointment = (car: any) => {
		// Navigate to customer instant quote to collect route information
		navigate({ 
			to: "/dashboard/instant-quote",
			search: { 
				selectedCarId: car.id
			} 
		})
	}

	const handleViewDetails = (car: any) => {
		console.log("Navigating to car details:", car.id)
		try {
			navigate({ to: "/dashboard/car-details/$carId", params: { carId: car.id } })
		} catch (error) {
			console.error("Navigation error:", error)
		}
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-2xl font-bold">Browse Our Fleet</h1>
				<p className="text-muted-foreground">
					Choose from our selection of luxury vehicles for your chauffeur service
				</p>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center">
						{/* Search */}
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search cars by make, model, or name..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						{/* Category Filter */}
						<div className="flex gap-2 overflow-x-auto">
							<Button
								variant={selectedCategory === null ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedCategory(null)}
							>
								All Categories
							</Button>
							{uniqueCategories.map((category: any) => (
								<Button
									key={category.id}
									variant={selectedCategory === category.id ? "default" : "outline"}
									size="sm"
									onClick={() => setSelectedCategory(category.id)}
									className="whitespace-nowrap"
								>
									{category.name}
								</Button>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Error Display */}
			{carsError && (
				<Alert>
					<Car className="h-4 w-4" />
					<AlertDescription>
						Error loading cars: {carsError.message}
					</AlertDescription>
				</Alert>
			)}

			{/* Debug Info */}
			{process.env.NODE_ENV === "development" && (
				<Alert>
					<AlertDescription>
						Debug: Found {cars.length} cars, Loading: {carsLoading.toString()}, Categories: {uniqueCategories.length}
					</AlertDescription>
				</Alert>
			)}

			{/* Cars Grid */}
			{carsLoading ? (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Card key={i}>
							<CardHeader className="pb-3">
								<Skeleton className="h-48 w-full rounded-lg" />
								<Skeleton className="h-6 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</CardHeader>
							<CardContent className="pt-0">
								<div className="space-y-3">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-2/3" />
									<Skeleton className="h-9 w-full" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : filteredCars.length === 0 ? (
				<Alert>
					<Car className="h-4 w-4" />
					<AlertDescription>
						{searchQuery || selectedCategory
							? "No cars found matching your criteria. Try adjusting your search or filters."
							: "No cars are currently available for booking."}
					</AlertDescription>
				</Alert>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{filteredCars.map((car: any) => (
						<CarCard
							key={car.id}
							car={car}
							onBookAppointment={() => handleBookAppointment(car)}
							onViewDetails={() => handleViewDetails(car)}
						/>
					))}
				</div>
			)}

			{/* Results Count */}
			{!carsLoading && (
				<div className="text-center text-sm text-muted-foreground">
					Showing {filteredCars.length} of {cars.length} available vehicles
				</div>
			)}

		</div>
	)
}

function CarCard({ 
	car, 
	onBookAppointment, 
	onViewDetails 
}: {
	car: any
	onBookAppointment: () => void
	onViewDetails: () => void
}) {
	const primaryImage = car.images?.[0]?.url
	const defaultImage = "/api/placeholder/400/240"

	return (
		<Card className="overflow-hidden transition-shadow hover:shadow-lg">
			{/* Car Image */}
			<div className="relative aspect-video overflow-hidden">
				<img
					src={primaryImage || defaultImage}
					alt={`${car.model?.brand?.name} ${car.model?.name}`}
					className="h-full w-full object-cover transition-transform hover:scale-105"
					onError={(e) => {
						e.currentTarget.src = defaultImage
					}}
				/>
				{car.category && (
					<Badge className="absolute left-3 top-3 bg-black/80 text-white">
						{car.category.name}
					</Badge>
				)}
				<div className="absolute right-3 top-3 flex gap-2">
					<Button
						size="sm"
						variant="secondary"
						className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
						onClick={onViewDetails}
					>
						<Eye className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<CardHeader className="pb-3">
				<CardTitle className="line-clamp-1">
					{car.model?.brand?.name} {car.model?.name}
				</CardTitle>
				<CardDescription className="line-clamp-1">
					{car.model?.year} • {car.name}
				</CardDescription>
			</CardHeader>

			<CardContent className="pt-0 space-y-4">
				{/* Car Features */}
				<div className="grid grid-cols-2 gap-3 text-sm">
					<div className="flex items-center gap-2">
						<Users className="h-4 w-4 text-muted-foreground" />
						<span>{car.seatingCapacity} passengers</span>
					</div>
					<div className="flex items-center gap-2">
						<Fuel className="h-4 w-4 text-muted-foreground" />
						<span>{car.fuelType?.name || "Fuel"}</span>
					</div>
					<div className="flex items-center gap-2">
						<Settings className="h-4 w-4 text-muted-foreground" />
						<span>{car.transmissionType?.name || "Auto"}</span>
					</div>
					<div className="flex items-center gap-2">
						<Briefcase className="h-4 w-4 text-muted-foreground" />
						<span>{(car as any).luggageCapacity || "Standard luggage"}</span>
					</div>
				</div>

				{/* Car Features Tags */}
				{car.carsToFeatures && car.carsToFeatures.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{car.carsToFeatures.slice(0, 3).map((carFeature: any) => (
							<Badge key={carFeature.feature.id} variant="secondary" className="text-xs">
								{carFeature.feature.name}
							</Badge>
						))}
						{car.carsToFeatures.length > 3 && (
							<Badge variant="outline" className="text-xs">
								+{car.carsToFeatures.length - 3} more
							</Badge>
						)}
					</div>
				)}

				{/* Transparent Pricing */}
				<div className="bg-muted/50 rounded-lg p-3 text-center">
					<div className="text-xs font-medium text-muted-foreground mb-1">Starting from</div>
					<CarPriceDisplay 
						carId={car.id}
						variant="card"
						className="justify-center"
					/>
				</div>

				<Separator />

				{/* Action Buttons */}
				<div className="flex gap-2">
					<Button onClick={onBookAppointment} className="flex-1">
						<Calendar className="mr-2 h-4 w-4" />
						Book Appointment
					</Button>
					<Button variant="outline" onClick={onViewDetails} className="px-3">
						<Eye className="h-4 w-4" />
					</Button>
				</div>

				{/* Availability Status */}
				<div className="flex items-center justify-center gap-2 text-xs text-green-600">
					<div className="h-2 w-2 rounded-full bg-green-600" />
					Available for booking
				</div>
			</CardContent>
		</Card>
	)
}