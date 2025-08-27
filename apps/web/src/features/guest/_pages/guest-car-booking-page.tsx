import { useParams, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { GuestCarBookingForm } from "../_components/guest-car-booking-form";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ArrowLeft, Car, Users, Fuel, Gauge, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function GuestCarBookingPage() {
	const { carId } = useParams({ from: "/_marketing/book-car/$carId" });
	const search = useSearch({ from: "/_marketing/book-car/$carId" });

	const { data: car, isLoading } = useQuery(
		trpc.cars.getPublished.queryOptions({ id: carId })
	);

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
					<div className="h-64 bg-gray-200 rounded mb-6"></div>
				</div>
			</div>
		);
	}

	if (!car) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">Car Not Found</h2>
					<p className="text-gray-600 mb-6">The requested car could not be found.</p>
					<Link to="/">
						<Button>Return Home</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Back Button */}
			<Link to="/services" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Cars
			</Link>

			<div className="grid md:grid-cols-2 gap-8">
				{/* Car Details */}
				<Card>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div>
								<CardTitle className="text-2xl">
									{car.brand?.name} {car.model?.name}
								</CardTitle>
								<p className="text-sm text-gray-600 mt-1">{car.year}</p>
							</div>
							<div className="text-right">
								<p className="text-2xl font-bold text-green-600">
									${car.pricePerDay}
								</p>
								<p className="text-sm text-gray-500">per day</p>
							</div>
						</div>
					</CardHeader>
					
					<CardContent className="space-y-4">
						{car.description && (
							<p className="text-gray-700">{car.description}</p>
						)}

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center text-gray-600">
								<Car className="mr-2 h-4 w-4" />
								<span className="text-sm">{car.category?.name}</span>
							</div>
							
							<div className="flex items-center text-gray-600">
								<Users className="mr-2 h-4 w-4" />
								<span className="text-sm">{car.seats} seats</span>
							</div>

							<div className="flex items-center text-gray-600">
								<Fuel className="mr-2 h-4 w-4" />
								<span className="text-sm">{car.fuelType?.name}</span>
							</div>

							<div className="flex items-center text-gray-600">
								<Gauge className="mr-2 h-4 w-4" />
								<span className="text-sm">{car.transmission?.name}</span>
							</div>
						</div>

						{car.features && car.features.length > 0 && (
							<div>
								<h4 className="font-semibold mb-2">Features</h4>
								<ul className="space-y-1">
									{car.features.map((feature) => (
										<li key={feature.id} className="flex items-center text-sm text-gray-600">
											<Star className="mr-2 h-3 w-3 text-yellow-500" />
											{feature.name}
										</li>
									))}
								</ul>
							</div>
						)}

						{car.imageUrls && car.imageUrls.length > 0 && (
							<div>
								<img 
									src={car.imageUrls[0]} 
									alt={`${car.brand?.name} ${car.model?.name}`}
									className="w-full h-48 object-cover rounded-lg"
								/>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Booking Form */}
				<Card>
					<CardHeader>
						<CardTitle>Book This Car</CardTitle>
						<p className="text-sm text-gray-600">
							No account required - book as a guest
						</p>
					</CardHeader>
					<CardContent>
						<GuestCarBookingForm car={car} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}