import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { format } from "date-fns";
import {
	ArrowLeft,
	Briefcase,
	Calendar,
	Car,
	ChevronLeft,
	ChevronRight,
	Clock,
	Fuel,
	Heart,
	MapPin,
	MessageSquare,
	Phone,
	Settings,
	Share2,
	Shield,
	Star,
	Users,
} from "lucide-react";
import { useState } from "react";
import { useGetCarDetailsQuery } from "@/features/customer/_hooks/query/use-get-car-details-query";
import { useGetReviewsForCarQuery } from "@/features/customer/_hooks/query/use-get-reviews-for-car-query";

export const Route = createFileRoute("/dashboard/_layout/car-details/$carId")({
	component: CarDetailsPage,
});

function CarDetailsPage() {
	const { carId } = Route.useParams();
	const navigate = useNavigate();
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	const { data: car, isLoading, error } = useGetCarDetailsQuery(carId);

	const handleBookAppointment = () => {
		navigate({ to: "/dashboard/book-appointment/$carId", params: { carId } });
	};

	const handleBack = () => {
		navigate({ to: "/fleet" });
	};

	if (isLoading) {
		return <CarDetailsLoading />;
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
		);
	}

	const images = car.images?.length
		? car.images
		: [{ url: "/api/placeholder/800/600" }];

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % images.length);
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
	};

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
						<Heart className="mr-2 h-4 w-4" />
						Save
					</Button>
					<Button variant="outline" size="sm">
						<Share2 className="mr-2 h-4 w-4" />
						Share
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				{/* Main Content - Left Column */}
				<div className="space-y-6 lg:col-span-2">
					{/* Image Gallery */}
					<Card className="overflow-hidden">
						<div className="relative">
							<div className="aspect-video overflow-hidden">
								<img
									src={
										images[currentImageIndex]?.url || "/api/placeholder/800/600"
									}
									alt={`${car.model?.brand?.name} ${car.model?.name}`}
									className="h-full w-full object-cover"
									onError={(e) => {
										e.currentTarget.src = "/api/placeholder/800/600";
									}}
								/>
							</div>

							{images.length > 1 && (
								<>
									<Button
										variant="secondary"
										size="sm"
										className="-translate-y-1/2 absolute top-1/2 left-4 h-8 w-8 bg-black/60 p-0 text-white hover:bg-black/80"
										onClick={prevImage}
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<Button
										variant="secondary"
										size="sm"
										className="-translate-y-1/2 absolute top-1/2 right-4 h-8 w-8 bg-black/60 p-0 text-white hover:bg-black/80"
										onClick={nextImage}
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</>
							)}

							{car.category && (
								<Badge className="absolute top-4 left-4 bg-black/80 text-white">
									{car.category.name}
								</Badge>
							)}

							<div className="absolute top-4 right-4 rounded bg-black/60 px-2 py-1 text-sm text-white">
								{currentImageIndex + 1} / {images.length}
							</div>
						</div>

						{/* Thumbnail Navigation */}
						{images.length > 1 && (
							<div className="flex gap-2 overflow-x-auto p-4">
								{images.map((image, index) => (
									<button
										key={index}
										onClick={() => setCurrentImageIndex(index)}
										className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
											index === currentImageIndex
												? "border-primary"
												: "border-transparent"
										}`}
									>
										<img
											src={image.url || "/api/placeholder/100/100"}
											alt={"Thumbnail ${index + 1}"}
											className="h-full w-full object-cover"
											onError={(e) => {
												e.currentTarget.src = "/api/placeholder/100/100";
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
									<CardDescription className="mt-1 text-lg">
										{car.model?.year} • {car.name}
									</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
									<span className="font-semibold text-lg">4.84</span>
									<span className="text-muted-foreground">(324 reviews)</span>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Key Specifications */}
							<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
								<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
									<Users className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="font-medium">{car.seatingCapacity}</div>
										<div className="text-muted-foreground text-sm">
											Passengers
										</div>
									</div>
								</div>
								<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
									<Briefcase className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="font-medium">
											{car.luggageCapacity || "3"}
										</div>
										<div className="text-muted-foreground text-sm">Luggage</div>
									</div>
								</div>
								<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
									<Settings className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="font-medium">
											{car.transmissionType?.name || "Auto"}
										</div>
										<div className="text-muted-foreground text-sm">
											Transmission
										</div>
									</div>
								</div>
								<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
									<Fuel className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="font-medium">
											{car.fuelType?.name || "Petrol"}
										</div>
										<div className="text-muted-foreground text-sm">
											Fuel Type
										</div>
									</div>
								</div>
							</div>

							{/* Features */}
							{car.features && car.features.length > 0 && (
								<div>
									<h3 className="mb-3 font-semibold">This Service offers</h3>
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
								<h3 className="mb-3 font-semibold">Overview</h3>
								<p className="text-muted-foreground leading-relaxed">
									{car.description ||
										`Experience luxury and comfort with our premium ${car.model?.brand?.name} ${car.model?.name}. This vehicle combines elegance with performance, making it perfect for your chauffeur service needs. Whether for business trips, special events, or airport transfers, this car ensures a smooth and prestigious journey.`}
								</p>
							</div>

							{/* Additional Details */}
							<div>
								<h3 className="mb-3 font-semibold">Additional Information</h3>
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
									<div className="font-bold text-2xl">
										$120
										<span className="font-normal text-base text-muted-foreground">
											/hour
										</span>
									</div>
									<div className="mt-1 flex items-center gap-1">
										<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
										<span className="font-medium">4.84</span>
									</div>
								</div>
								<Badge
									variant="outline"
									className="border-green-600 text-green-600"
								>
									Available
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
								<div>
									<div className="text-muted-foreground text-sm">Start</div>
									<div className="font-medium">17/07/2022</div>
								</div>
								<div>
									<div className="text-muted-foreground text-sm">End</div>
									<div className="font-medium">21/07/2022</div>
								</div>
							</div>

							<div className="space-y-3 rounded-lg border p-3">
								<div className="text-muted-foreground text-sm">Guests</div>
								<select className="w-full rounded-md border p-2">
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

							<Button
								onClick={handleBookAppointment}
								className="w-full"
								size="lg"
							>
								Reserve
							</Button>

							<p className="text-center text-muted-foreground text-xs">
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
							<div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
								<div className="text-center">
									<MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
									<p className="text-muted-foreground text-sm">
										Map will be shown here
									</p>
								</div>
							</div>
							<p className="mt-3 text-muted-foreground text-sm">
								Available for pickup anywhere in Sydney metropolitan area.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

function CarDetailsLoading() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-10 w-32" />

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					<Card>
						<Skeleton className="aspect-video w-full" />
						<div className="flex gap-2 p-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={i} className="h-16 w-16 rounded-lg" />
							))}
						</div>
					</Card>

					<Card>
						<CardHeader>
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-6 w-48" />
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
	);
}

function ReviewsSection({ carId }: { carId: string }) {
	const [showAll, setShowAll] = useState(false);
	const { data, isLoading } = useGetReviewsForCarQuery(carId);

	const reviews = data?.reviews ?? [];
	const totalReviews = data?.totalReviews ?? 0;
	const averageRating = data?.averageRating ?? 0;
	const ratingDistribution = data?.ratingDistribution ?? {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
	};

	const displayedReviews = showAll ? reviews : reviews.slice(0, 2);
	const distEntries = [5, 4, 3, 2, 1].map((stars) => ({
		stars,
		count: ratingDistribution[stars] ?? 0,
		percentage:
			totalReviews > 0
				? ((ratingDistribution[stars] ?? 0) / totalReviews) * 100
				: 0,
	}));

	if (isLoading) {
		return (
			<Card>
				<CardContent className="py-8">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="mt-4 h-32 w-full" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
						<span className="font-bold text-2xl">
							{averageRating.toFixed(1)}
						</span>
					</div>
					<div>
						<div className="font-semibold text-lg">
							({totalReviews} reviews)
						</div>
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
									<div className="flex w-12 items-center gap-1">
										<span className="text-sm">{rating.stars}</span>
										<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
									</div>
									<Progress value={rating.percentage} className="h-2 flex-1" />
									<span className="w-8 text-muted-foreground text-sm">
										{rating.count}
									</span>
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
											<AvatarFallback>
												{review.author
													?.split(" ")
													.map((n) => n[0])
													.join("") || "?"}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<div className="mb-1 flex items-center gap-2">
												<span className="font-semibold">{review.author}</span>
												<span className="text-muted-foreground">•</span>
												<span className="text-muted-foreground text-sm">
													{review.createdAt
														? format(new Date(review.createdAt), "MMMM yyyy")
														: ""}
												</span>
											</div>
											<div className="mb-2 flex items-center gap-1">
												{Array.from({ length: 5 }).map((_, i) => (
													<Star
														key={i}
														className={`h-4 w-4 ${
															i < (review.rating ?? 0)
																? "fill-yellow-400 text-yellow-400"
																: "text-muted-foreground/30"
														}`}
													/>
												))}
											</div>
											{review.review && (
												<p className="text-muted-foreground text-sm leading-relaxed">
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
								{showAll
									? "Show less reviews"
									: `Show all ${reviews.length} reviews`}
							</Button>
						)}
					</>
				) : (
					<p className="py-4 text-muted-foreground text-sm">
						No reviews yet. Be the first to share your experience!
					</p>
				)}
			</CardContent>
		</Card>
	);
}
