import { useParams, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { GuestServiceBookingForm } from "../_components/guest-service-booking-form";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ArrowLeft, MapPin, Clock, Users, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function GuestServiceBookingPage() {
	const { serviceId } = useParams({ from: "/_marketing/book-service/$serviceId" });
	const search = useSearch({ from: "/_marketing/book-service/$serviceId" });

	const { data: service, isLoading } = useQuery(
		trpc.packages.getPublished.queryOptions({ id: serviceId })
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

	if (!service) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
					<p className="text-gray-600 mb-6">The requested service could not be found.</p>
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
				Back to Services
			</Link>

			<div className="grid md:grid-cols-2 gap-8">
				{/* Service Details */}
				<Card>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div>
								<CardTitle className="text-2xl">{service.name}</CardTitle>
								<p className="text-sm text-gray-600 mt-1">{service.serviceType}</p>
							</div>
							<div className="text-right">
								<p className="text-2xl font-bold text-green-600">
									${service.price}
								</p>
								<p className="text-sm text-gray-500">per booking</p>
							</div>
						</div>
					</CardHeader>
					
					<CardContent className="space-y-4">
						{service.description && (
							<p className="text-gray-700">{service.description}</p>
						)}

						<div className="grid grid-cols-2 gap-4">
							{service.duration && (
								<div className="flex items-center text-gray-600">
									<Clock className="mr-2 h-4 w-4" />
									<span className="text-sm">{service.duration} hours</span>
								</div>
							)}
							
							{service.maxPassengers && (
								<div className="flex items-center text-gray-600">
									<Users className="mr-2 h-4 w-4" />
									<span className="text-sm">Up to {service.maxPassengers} passengers</span>
								</div>
							)}
						</div>

						{service.features && service.features.length > 0 && (
							<div>
								<h4 className="font-semibold mb-2">Features</h4>
								<ul className="space-y-1">
									{service.features.map((feature, index) => (
										<li key={index} className="flex items-center text-sm text-gray-600">
											<Star className="mr-2 h-3 w-3 text-yellow-500" />
											{feature}
										</li>
									))}
								</ul>
							</div>
						)}

						{service.imageUrls && service.imageUrls.length > 0 && (
							<div>
								<img 
									src={service.imageUrls[0]} 
									alt={service.name}
									className="w-full h-48 object-cover rounded-lg"
								/>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Booking Form */}
				<Card>
					<CardHeader>
						<CardTitle>Book This Service</CardTitle>
						<p className="text-sm text-gray-600">
							No account required - book as a guest
						</p>
					</CardHeader>
					<CardContent>
						<GuestServiceBookingForm service={service} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}