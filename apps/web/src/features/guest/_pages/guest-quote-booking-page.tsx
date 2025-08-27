import { useSearch } from "@tanstack/react-router";
import { GuestQuoteBookingForm } from "../_components/guest-quote-booking-form";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ArrowLeft, MapPin, Clock, DollarSign, Route } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function GuestQuoteBookingPage() {
	const search = useSearch({ from: "/_marketing/book-quote" });

	if (!search.origin || !search.destination || !search.totalFare) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">Quote Information Missing</h2>
					<p className="text-gray-600 mb-6">Please generate a quote first before booking.</p>
					<Link to="/">
						<Button>Get Instant Quote</Button>
					</Link>
				</div>
			</div>
		);
	}

	const quoteData = {
		origin: search.origin,
		destination: search.destination,
		distance: search.distance ? parseFloat(search.distance) : 0,
		duration: search.duration ? parseFloat(search.duration) : 0,
		totalFare: parseFloat(search.totalFare),
	};

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Back Button */}
			<Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Quote Calculator
			</Link>

			<div className="grid md:grid-cols-2 gap-8">
				{/* Quote Details */}
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">Trip Details</CardTitle>
						<p className="text-sm text-gray-600">Review your custom trip quote</p>
					</CardHeader>
					
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-start space-x-3">
								<MapPin className="h-5 w-5 text-green-600 mt-0.5" />
								<div>
									<p className="font-medium">Pickup Location</p>
									<p className="text-sm text-gray-600">{quoteData.origin}</p>
								</div>
							</div>

							<div className="flex items-start space-x-3">
								<MapPin className="h-5 w-5 text-red-600 mt-0.5" />
								<div>
									<p className="font-medium">Destination</p>
									<p className="text-sm text-gray-600">{quoteData.destination}</p>
								</div>
							</div>
						</div>

						{quoteData.distance > 0 && (
							<div className="grid grid-cols-2 gap-4 pt-4 border-t">
								<div className="flex items-center space-x-2">
									<Route className="h-4 w-4 text-gray-500" />
									<div>
										<p className="text-sm font-medium">Distance</p>
										<p className="text-sm text-gray-600">{quoteData.distance.toFixed(1)} km</p>
									</div>
								</div>

								{quoteData.duration > 0 && (
									<div className="flex items-center space-x-2">
										<Clock className="h-4 w-4 text-gray-500" />
										<div>
											<p className="text-sm font-medium">Duration</p>
											<p className="text-sm text-gray-600">{Math.round(quoteData.duration)} mins</p>
										</div>
									</div>
								)}
							</div>
						)}

						<div className="border-t pt-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<DollarSign className="h-5 w-5 text-green-600" />
									<span className="font-semibold">Total Fare</span>
								</div>
								<span className="text-2xl font-bold text-green-600">
									${quoteData.totalFare.toFixed(2)}
								</span>
							</div>
							<p className="text-xs text-gray-500 mt-2">
								Includes base fare, distance charges, and applicable fees
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Booking Form */}
				<Card>
					<CardHeader>
						<CardTitle>Book This Trip</CardTitle>
						<p className="text-sm text-gray-600">
							No account required - book as a guest
						</p>
					</CardHeader>
					<CardContent>
						<GuestQuoteBookingForm quoteData={quoteData} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}