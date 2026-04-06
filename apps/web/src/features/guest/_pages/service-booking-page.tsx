import { Link, useParams, useSearch } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { useGetPublishedServiceByIdQuery } from "@/features/customer/_hooks/query/use-get-published-service-by-id-query";
import { HourlyServiceBookingForm } from "../_components/hourly-service-booking-form";
import { ServiceBookingForm } from "../_components/service-booking-form";

export function ServiceBookingPage() {
	const { serviceId } = useParams({
		from: "/_marketing/book-service/$serviceId",
	});
	const search = useSearch({ from: "/_marketing/book-service/$serviceId" });

	const routePrefill = useMemo(() => {
		if (search.fromInstantQuote !== "1") return undefined;
		let stopAddresses: string[] | undefined;
		if (search.stops) {
			try {
				const parsed = JSON.parse(search.stops) as unknown;
				if (Array.isArray(parsed)) {
					stopAddresses = parsed
						.map((s) =>
							typeof s === "string" ? s : (s as { address?: string })?.address,
						)
						.filter((a): a is string => Boolean(a?.trim()));
				}
			} catch {
				// ignore
			}
		}
		return {
			originAddress: search.origin,
			destinationAddress: search.destination,
			pickupDate: search.pickupDate,
			pickupTime: search.pickupTime,
			stopAddresses,
			carId: search.carId,
		};
	}, [search]);

	const { data: service, isLoading } =
		useGetPublishedServiceByIdQuery(serviceId);

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

	if (!service) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h2 className="mb-4 font-bold text-2xl">Service Not Found</h2>
					<p className="mb-6 text-gray-600">
						The requested service could not be found.
					</p>
					<Link to="/">
						<Button>Return Home</Button>
					</Link>
				</div>
			</div>
		);
	}

	// Debug logging to see service data
	console.log("Service booking data:", {
		service,
		serviceType: service.serviceType,
		hourlyRate: service.hourlyRate,
		fixedPrice: service.fixedPrice,
		hasHourlyRate: service.hourlyRate && service.hourlyRate > 0,
		hasFixedPrice: service.fixedPrice && service.fixedPrice > 0,
	});

	// Determine if this is an hourly service
	const isHourlyService =
		service.serviceType?.rateType === "hourly" ||
		(service.hourlyRate && service.hourlyRate > 0) ||
		(!service.fixedPrice && service.hourlyRate);

	console.log("Is hourly service:", isHourlyService);

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Back Button */}
			<Link
				to="/services"
				className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Services
			</Link>

			<div className="grid gap-8">
				{/* Conditionally render appropriate booking form */}
				{isHourlyService ? (
					<HourlyServiceBookingForm
						service={service}
						routePrefill={routePrefill}
					/>
				) : (
					<ServiceBookingForm service={service} />
				)}
			</div>
		</div>
	);
}
