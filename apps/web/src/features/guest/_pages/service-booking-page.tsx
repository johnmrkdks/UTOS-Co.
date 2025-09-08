import { useParams, useSearch } from "@tanstack/react-router";
import { useGetPublishedServiceByIdQuery } from "@/features/customer/_hooks/query/use-get-published-service-by-id-query";
import { ServiceBookingForm } from "../_components/service-booking-form";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ArrowLeft, MapPin, Clock, Users, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ServiceBookingPage() {
	const { serviceId } = useParams({ from: "/_marketing/book-service/$serviceId" });
	const search = useSearch({ from: "/_marketing/book-service/$serviceId" });

	const { data: service, isLoading } = useGetPublishedServiceByIdQuery(serviceId);

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

			<div className="grid  gap-8">
				{/* Booking Form */}
				<ServiceBookingForm service={service} />
			</div>
		</div>
	);
}
