import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { ArrowLeft, Calendar, Users, Settings, Fuel, Star, MapPin, Share2, Heart, Phone, MessageSquare, Clock, Shield, Briefcase, Car, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Separator } from "@workspace/ui/components/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Progress } from "@workspace/ui/components/progress"
import { useGetCarDetailsQuery } from "@/features/customer/_hooks/query/use-get-car-details-query"
import { useGetReviewsForCarQuery } from "@/features/customer/_hooks/query/use-get-reviews-for-car-query"
import { format } from "date-fns"

export const Route = createFileRoute("/dashboard/_layout/car-details/$carId")({
	component: CarDetailsPage,
})

function CarDetailsPage() {
	const { carId } = Route.useParams()
	const navigate = useNavigate()
	const [currentImageIndex, setCurrentImageIndex] = useState(0)

	const { data: car, isLoading, error } = useGetCarDetailsQuery(carId)

	const handleBookAppointment = () => {
		navigate({ to: "/dashboard/book-appointment/$carId", params: { carId } })
	}

	const handleBack = () => {
		navigate({ to: "/dashboard/cars" })
	}

	if (isLoading) {
		return <CarDetailsLoading />
	}

	if (error || !car) {
		return (
			<div className="space-y-6">
				<Button variant="ghost" onClick={handleBack} className="mb-4">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Cars
				</Button>
				<Alert>
					<Car className="h-4 w-4" />
					<AlertDescription>
						{error?.message || "Car not found or not available"}
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	const images = car.images?.length ? car.images : [{ url: "/api/placeholder/800/600" }]

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % images.length)
	}

	const prevImage = () => {
		setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Button variant="ghost" onClick={handleBack} className="mb-4">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Cars
				</Button>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						<Heart className="h-4 w-4 mr-2" />
						Save
					</Button>
					<Button variant="outline" size="sm">
						<Share2 className="h-4 w-4 mr-2" />
						Share
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Main Content - Left Column */}
				<div className="lg:col-span-2 space-y-6">
					{/* Image Gallery */}
					<Card className="overflow-hidden">
						<div className="relative">
							<div className="aspect-video overflow-hidden">
								<img
									src={images[currentImageIndex]?.url || "/api/placeholder/800/600"}
									alt={`${car.model?.brand?.name} ${car.model?.name}`}
									className="h-full w-full object-cover"
									onError={(e) => {
										e.currentTarget.src = "/api/placeholder/800/600"
									}}
								/>
							</div>
							
							{images.length > 1 && (
								<>
									<Button
										variant="secondary"
										size="sm"
										className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/60 hover:bg-black/80 text-white"
										onClick={prevImage}
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<Button
										variant="secondary"
										size="sm"
										className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/60 hover:bg-black/80 text-white"
										onClick={nextImage}
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</>
							)}

							{car.category && (
								<Badge className="absolute left-4 top-4 bg-black/80 text-white">
									{car.category.name}
								</Badge>
							)}

							<div className="absolute right-4 top-4 bg-black/60 text-white text-sm px-2 py-1 rounded">
								{currentImageIndex + 1} / {images.length}
							</div>
						</div>

						{/* Thumbnail Navigation */}
						{images.length > 1 && (
							<div className="flex gap-2 p-4 overflow-x-auto">
								{images.map((image, index) => (
									<button
										key={index}
										onClick={() => setCurrentImageIndex(index)}
										className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
											index === currentImageIndex ? "border-primary" : "border-transparent"
										}`}
									>
										<img
											src={image.url || "/api/placeholder/100/100"}
											alt={"Thumbnail ${index + 1}"}
											className="w-full h-full object-cover"
											onError={(e) => {
												e.currentTarget.src = "/api/placeholder/100/100"
											}}
										/>
									</button>
								))}
							</div>
						)}
					</Card>

					{/* Car Details */}
					<Card>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div>
									<CardTitle className="text-2xl">
										{car.model?.brand?.name} {car.model?.name}
									</CardTitle>
									<CardDescription className="text-lg mt-1">
										{car.model?.year} • {car.name}
									</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
									<span className="text-lg font-semibold">4.84</span>
									<span className="text-muted-foreground">(324 reviews)</span>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Key Specifications */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
									<Users className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="font-medium">{car.seatingCapacity}</div>
										<div className="text-sm text-muted-foreground">Passengers</div>
									</div>
								</div>
								<div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
									<Briefcase className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="font-medium">{car.luggageCapacity || "3"}</div>
										<div className="text-sm text-muted-foreground">Luggage</div>
									</div>
								</div>
								<div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
									<Settings className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="font-medium">{car.transmissionType?.name || "Auto"}</div>
										<div className="text-sm text-muted-foreground">Transmission</div>
									</div>
								</div>
								<div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
									<Fuel className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="font-medium">{car.fuelType?.name || "Petrol"}</div>
										<div className="text-sm text-muted-foreground">Fuel Type</div>
									</div>
								</div>
							</div>

							{/* Features */}
							{car.features && car.features.length > 0 && (
								<div>
									<h3 className="font-semibold mb-3">This Service offers</h3>
									<div className="grid grid-cols-2 gap-3">
										{car.features.map((feature: any) => (
											<div key={feature.id} className="flex items-center gap-2">
												<Shield className="h-4 w-4 text-green-600" />
												<span className="text-sm">{feature.name}</span>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Description */}
							<div>
								<h3 className="font-semibold mb-3">Overview</h3>
								<p className="text-muted-foreground leading-relaxed">
									{car.description || `Experience luxury and comfort with our premium ${car.model?.brand?.name} ${car.model?.name}. This vehicle combines elegance with performance, making it perfect for your chauffeur service needs. Whether for business trips, special events, or airport transfers, this car ensures a smooth and prestigious journey.`}
								</p>
							</div>

							{/* Additional Details */}
							<div>
								<h3 className="font-semibold mb-3">Additional Information</h3>
								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span>Free cancellation for 12 hours</span>
									</div>
									<div className="flex items-center gap-2">
										<Shield className="h-4 w-4 text-muted-foreground" />
										<span>Professional chauffeur included</span>
									</div>
									<div className="flex items-center gap-2">
										<MapPin className="h-4 w-4 text-muted-foreground" />
										<span>Available Sydney-wide</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Reviews Section */}
					<ReviewsSection carId={carId} />
				</div>

				{/* Sidebar - Right Column */}
				<div className="space-y-6">
					{/* Booking Card */}
					<Card className="sticky top-6">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-2xl font-bold">$120<span className="text-base font-normal text-muted-foreground">/hour</span></div>
									<div className="flex items-center gap-1 mt-1">
										<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
										<span className="font-medium">4.84</span>
									</div>
								</div>
								<Badge variant="outline" className="text-green-600 border-green-600">
									Available
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-3 p-3 border rounded-lg">
								<div>
									<div className="text-sm text-muted-foreground">Start</div>
									<div className="font-medium">17/07/2022</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground">End</div>
									<div className="font-medium">21/07/2022</div>
								</div>
							</div>

							<div className="space-y-3 p-3 border rounded-lg">
								<div className="text-sm text-muted-foreground">Guests</div>
								<select className="w-full p-2 border rounded-md">
									<option>2 guests</option>
									<option>3 guests</option>
									<option>4 guests</option>
								</select>
							</div>

							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span>$120 x 4 days</span>
									<span>$480</span>
								</div>
								<div className="flex justify-between">
									<span>New user discount</span>
									<span className="text-green-600">-$40</span>
								</div>
								<div className="flex justify-between">
									<span>Service fee</span>
									<span>$10</span>
								</div>
								<Separator />
								<div className="flex justify-between font-semibold">
									<span>Total (USD)</span>
									<span>$450</span>
								</div>
							</div>

							<Button onClick={handleBookAppointment} className="w-full" size="lg">
								Reserve
							</Button>

							<p className="text-center text-xs text-muted-foreground">
								You won't be charged yet
							</p>

							<Separator />

							<div className="flex gap-2">
								<Button variant="outline" className="flex-1">
									<MessageSquare className="mr-2 h-4 w-4" />
									Message
								</Button>
								<Button variant="outline" className="flex-1">
									<Phone className="mr-2 h-4 w-4" />
									Call
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Location Map Placeholder */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Location</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
								<div className="text-center">
									<MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
									<p className="text-sm text-muted-foreground">Map will be shown here</p>
								</div>
							</div>
							<p className="text-sm text-muted-foreground mt-3">
								Available for pickup anywhere in Sydney metropolitan area.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

function CarDetailsLoading() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-10 w-32" />
			
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<Skeleton className="aspect-video w-full" />
						<div className="flex gap-2 p-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={i} className="w-16 h-16 rounded-lg" />
							))}
						</div>
					</Card>
					
					<Card>
						<CardHeader>
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-6 w-48" />
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{Array.from({ length: 4 }).map((_, i) => (
									<Skeleton key={i} className="h-20" />
								))}
							</div>
							<Skeleton className="h-24 w-full" />
							<Skeleton className="h-16 w-full" />
						</CardContent>
					</Card>
				</div>
				
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<Skeleton className="h-8 w-24" />
							<Skeleton className="h-4 w-16" />
						</CardHeader>
						<CardContent className="space-y-4">
							<Skeleton className="h-16 w-full" />
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-24 w-full" />
							<Skeleton className="h-12 w-full" />
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

function ReviewsSection({ carId }: { carId: string }) {
	const [showAll, setShowAll] = useState(false)
	const { data, isLoading } = useGetReviewsForCarQuery(carId)

	const reviews = data?.reviews ?? []
	const totalReviews = data?.totalReviews ?? 0
	const averageRating = data?.averageRating ?? 0
	const ratingDistribution = data?.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

	const displayedReviews = showAll ? reviews : reviews.slice(0, 2)
	const distEntries = [5, 4, 3, 2, 1].map((stars) => ({
		stars,
		count: ratingDistribution[stars] ?? 0,
		percentage: totalReviews > 0 ? ((ratingDistribution[stars] ?? 0) / totalReviews) * 100 : 0,
	}))

	if (isLoading) {
		return (
			<Card>
				<CardContent className="py-8">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-32 w-full mt-4" />
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
						<span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
					</div>
					<div>
						<div className="text-lg font-semibold">({totalReviews} reviews)</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{totalReviews > 0 ? (
					<>
						{/* Rating Distribution */}
						<div className="space-y-2">
							{distEntries.map((rating) => (
								<div key={rating.stars} className="flex items-center gap-3">
									<div className="flex items-center gap-1 w-12">
										<span className="text-sm">{rating.stars}</span>
										<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
									</div>
									<Progress value={rating.percentage} className="flex-1 h-2" />
									<span className="text-sm text-muted-foreground w-8">{rating.count}</span>
								</div>
							))}
						</div>

						<Separator />

						{/* Individual Reviews */}
						<div className="space-y-4">
							{displayedReviews.map((review) => (
								<div key={review.id} className="space-y-3">
									<div className="flex items-start gap-3">
										<Avatar className="h-10 w-10">
											<AvatarFallback>{review.author?.split(' ').map(n => n[0]).join('') || '?'}</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<span className="font-semibold">{review.author}</span>
												<span className="text-muted-foreground">•</span>
												<span className="text-sm text-muted-foreground">
													{review.createdAt ? format(new Date(review.createdAt), "MMMM yyyy") : ""}
												</span>
											</div>
											<div className="flex items-center gap-1 mb-2">
												{Array.from({ length: 5 }).map((_, i) => (
													<Star
														key={i}
														className={`h-4 w-4 ${
															i < (review.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
														}`}
													/>
												))}
											</div>
											{review.review && (
												<p className="text-sm text-muted-foreground leading-relaxed">
													{review.review}
												</p>
											)}
										</div>
									</div>
								</div>
							))}
						</div>

						{reviews.length > 2 && (
							<Button
								variant="outline"
								onClick={() => setShowAll(!showAll)}
								className="w-full"
							>
								{showAll ? 'Show less reviews' : `Show all ${reviews.length} reviews`}
							</Button>
						)}
					</>
				) : (
					<p className="text-sm text-muted-foreground py-4">No reviews yet. Be the first to share your experience!</p>
				)}
			</CardContent>
		</Card>
	)
}