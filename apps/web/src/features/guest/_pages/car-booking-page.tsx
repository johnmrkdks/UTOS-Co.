import { Link, useParams, useSearch } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { ArrowLeft, Car, Fuel, Gauge, Star, Users } from "lucide-react";
import { useGetPublishedCarByIdQuery } from "@/features/customer/_hooks/query/use-get-published-car-by-id-query";
import { CarBookingForm } from "../_components/car-booking-form";

export function CarBookingPage() {
	const { carId } = useParams({ from: "/_marketing/book-car/$carId" });
	const search = useSearch({ from: "/_marketing/book-car/$carId" });

	const { data: car, isLoading } = useGetPublishedCarByIdQuery(carId);

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse">
					<div className="mb-4 h-8 w-1/3 rounded bg-gray-200" />
					<div className="mb-6 h-64 rounded bg-gray-200" />
				</div>
			</div>
		);
	}

	if (!car) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h2 className="mb-4 font-bold text-2xl">Car Not Found</h2>
					<p className="mb-6 text-gray-600">
						The requested car could not be found.
					</p>
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
			<Link
				to="/services"
				className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Cars
			</Link>

			<div className="grid gap-8 md:grid-cols-2">
				{/* Car Details */}
				<Card>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div>
								<CardTitle className="text-2xl">
									{car.brand?.name} {car.model?.name}
								</CardTitle>
								<p className="mt-1 text-gray-600 text-sm">{car.year}</p>
							</div>
							<div className="text-right">
								<p className="font-bold text-2xl text-green-600">
									${car.pricePerDay}
								</p>
								<p className="text-gray-500 text-sm">per day</p>
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
								<h4 className="mb-2 font-semibold">Features</h4>
								<ul className="space-y-1">
									{car.features.map((feature) => (
										<li
											key={feature.id}
											className="flex items-center text-gray-600 text-sm"
										>
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
									className="h-48 w-full rounded-lg object-cover"
								/>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Booking Form */}
				<Card>
					<CardHeader>
						<CardTitle>Book This Car</CardTitle>
						<p className="text-gray-600 text-sm">Complete your car booking</p>
					</CardHeader>
					<CardContent>
						<CarBookingForm car={car} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
