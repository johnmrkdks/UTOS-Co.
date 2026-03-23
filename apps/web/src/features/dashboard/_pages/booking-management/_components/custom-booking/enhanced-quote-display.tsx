import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
	Calculator,
	CheckCircle,
	Clock,
	DollarSign,
	MapPin,
	Navigation,
	Route,
} from "lucide-react";
import React from "react";
import { formatDistanceKm } from "@/utils/format";
import { useGetPricingConfigsQuery } from "../../../pricing-config/_hooks/query/use-get-pricing-configs-query";
import type { QuoteResult } from "../../_types/booking";
import type { EnhancedCustomBookingForm } from "./enhanced-custom-booking-form";

interface EnhancedQuoteDisplayProps {
	quote: QuoteResult | null;
	isCalculating: boolean;
	formData?: Partial<EnhancedCustomBookingForm>;
	selectedCar?: {
		id: string;
		name: string;
		brand?: { name: string };
		model?: { name: string };
		category?: { name: string };
		features?: Array<{ name: string }>;
	} | null;
	onCalculateQuote?: () => void;
	canCalculateQuote?: boolean;
}

export function EnhancedQuoteDisplay({
	quote,
	isCalculating,
	formData,
	selectedCar,
	onCalculateQuote,
	canCalculateQuote = false,
}: EnhancedQuoteDisplayProps) {
	// Fetch pricing configuration for selected car
	const { data: carPricing } = useGetPricingConfigsQuery({
		carId: selectedCar?.id,
		limit: 1,
	});
	const formatPrice = (price: number) => `$${price.toFixed(2)}`;
	const formatDuration = (seconds: number) => {
		const minutes = Math.round(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;

		if (hours > 0) {
			return `${hours}h ${remainingMinutes}m`;
		}
		return `${minutes}m`;
	};

	if (isCalculating) {
		return (
			<Card className="h-fit">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5 animate-pulse" />
						Calculating Quote...
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="animate-pulse">
							<div className="mb-2 h-4 w-3/4 rounded bg-muted" />
							<div className="mb-2 h-4 w-1/2 rounded bg-muted" />
							<div className="h-4 w-2/3 rounded bg-muted" />
						</div>
						<Separator />
						<div className="animate-pulse">
							<div className="h-6 w-1/2 rounded bg-muted" />
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!quote) {
		return (
			<div className="space-y-4">
				{/* Price Calculation Section */}
				<Card className="h-fit">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calculator className="h-5 w-5 text-blue-600" />
							Price Calculation
						</CardTitle>
						<CardDescription>
							Calculate pricing for this booking
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<p className="text-muted-foreground text-sm">
								Fill in the form fields to enable quote calculation
							</p>
							<Button
								onClick={() => {
									// Trigger the form's calculate quote button instead of calling onCalculateQuote directly
									const formCalcButton = document.querySelector(
										"[data-form-calculate-quote]",
									) as HTMLButtonElement;
									if (formCalcButton) {
										formCalcButton.click();
									}
								}}
								disabled={!canCalculateQuote || isCalculating}
								className="w-full"
								type="button"
							>
								{isCalculating ? (
									<>
										<Calculator className="mr-2 h-4 w-4 animate-spin" />
										Calculating...
									</>
								) : (
									<>
										<Calculator className="mr-2 h-4 w-4" />
										Calculate Quote
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Quote Preview */}
				<Card className="h-fit">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calculator className="h-5 w-5 text-muted-foreground" />
							Quote Preview
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="py-8 text-center">
							<Calculator className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<p className="text-muted-foreground text-sm">
								Calculate a quote to see pricing details
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Price Calculation Section */}
			<Card className="h-fit">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5 text-blue-600" />
						Price Calculation
					</CardTitle>
					<CardDescription>
						Recalculate pricing for this booking
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<p className="text-muted-foreground text-sm">
							Current quote calculated successfully
						</p>
						<Button
							onClick={() => {
								// Trigger the form's calculate quote button instead of calling onCalculateQuote directly
								const formCalcButton = document.querySelector(
									"[data-form-calculate-quote]",
								) as HTMLButtonElement;
								if (formCalcButton) {
									formCalcButton.click();
								}
							}}
							disabled={!canCalculateQuote || isCalculating}
							className="w-full"
							variant="outline"
							type="button"
						>
							{isCalculating ? (
								<>
									<Calculator className="mr-2 h-4 w-4 animate-spin" />
									Recalculating...
								</>
							) : (
								<>
									<Calculator className="mr-2 h-4 w-4" />
									Recalculate Quote
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Selected Vehicle Summary */}
			{selectedCar && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<CheckCircle className="h-4 w-4 text-green-600" />
							Selected Vehicle
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="font-medium">{selectedCar.name}</span>
								{selectedCar.category && (
									<Badge variant="outline">{selectedCar.category.name}</Badge>
								)}
							</div>
							{selectedCar.brand && selectedCar.model && (
								<p className="text-muted-foreground text-sm">
									{selectedCar.brand.name} {selectedCar.model.name}
								</p>
							)}
							{selectedCar.features && selectedCar.features.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-1">
									{selectedCar.features.slice(0, 3).map((feature, index) => (
										<Badge key={index} variant="secondary" className="text-xs">
											{feature.name}
										</Badge>
									))}
									{selectedCar.features.length > 3 && (
										<Badge variant="secondary" className="text-xs">
											+{selectedCar.features.length - 3} more
										</Badge>
									)}
								</div>
							)}

							{/* Vehicle Pricing */}
							{carPricing?.data?.[0] && (
								<div className="mt-3 border-t pt-3">
									<h4 className="mb-2 font-medium text-muted-foreground text-xs">
										PRICING RATES
									</h4>
									<div className="space-y-1">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												First {carPricing.data[0].firstKmLimit || 10}km:
											</span>
											<span className="font-medium">
												{formatPrice(carPricing.data[0].firstKmRate)}
											</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												Additional per km:
											</span>
											<span className="font-medium">
												{formatPrice(carPricing.data[0].pricePerKm)}/km
											</span>
										</div>
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Route Summary */}
			{formData && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<Route className="h-4 w-4 text-blue-600" />
							Route Summary
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{/* Origin */}
							<div className="flex items-start gap-2">
								<div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
								<div className="min-w-0 flex-1">
									<p className="mb-0.5 font-medium text-green-700 text-xs">
										Pickup
									</p>
									<p className="text-muted-foreground text-xs leading-tight">
										{formData.originAddress || "Not specified"}
									</p>
								</div>
							</div>

							{/* Stops */}
							{formData.stops && formData.stops.length > 0 && (
								<>
									{formData.stops.map((stop, index) => (
										<div key={index}>
											<div className="ml-1 h-2 border-muted border-l" />
											<div className="flex items-start gap-2">
												<div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
												<div className="min-w-0 flex-1">
													<p className="mb-0.5 font-medium text-blue-700 text-xs">
														Stop {index + 1}
													</p>
													<p className="text-muted-foreground text-xs leading-tight">
														{stop.address}
													</p>
													{stop.waitingTime && stop.waitingTime > 0 && (
														<p className="text-amber-600 text-xs">
															Wait: {stop.waitingTime} min
														</p>
													)}
												</div>
											</div>
										</div>
									))}
									<div className="ml-1 h-2 border-muted border-l" />
								</>
							)}

							{/* Destination */}
							<div className="flex items-start gap-2">
								<div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
								<div className="min-w-0 flex-1">
									<p className="mb-0.5 font-medium text-red-700 text-xs">
										Destination
									</p>
									<p className="text-muted-foreground text-xs leading-tight">
										{formData.destinationAddress || "Not specified"}
									</p>
								</div>
							</div>
						</div>

						{/* Trip Stats */}
						{quote && (
							<div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
								<div className="text-center">
									<div className="mb-1 flex items-center justify-center gap-1">
										<Navigation className="h-3 w-3 text-muted-foreground" />
										<span className="text-muted-foreground text-xs">
											Distance
										</span>
									</div>
									<p className="font-medium text-sm">
										{formatDistanceKm(quote.estimatedDistance)}
									</p>
								</div>
								<div className="text-center">
									<div className="mb-1 flex items-center justify-center gap-1">
										<Clock className="h-3 w-3 text-muted-foreground" />
										<span className="text-muted-foreground text-xs">
											Duration
										</span>
									</div>
									<p className="font-medium text-sm">
										{formatDuration(quote.estimatedDuration)}
									</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Fare Breakdown */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-base">
						<DollarSign className="h-4 w-4 text-green-600" />
						Fare Breakdown
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{/* Base Fare */}
						{quote.baseFare > 0 && (
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">Base Fare</span>
								<span className="font-medium text-sm">
									{formatPrice(quote.baseFare)}
								</span>
							</div>
						)}

						{/* Distance Fare */}
						{quote.distanceFare > 0 && (
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Distance Fare ({formatDistanceKm(quote.estimatedDistance)})
								</span>
								<span className="font-medium text-sm">
									{formatPrice(quote.distanceFare)}
								</span>
							</div>
						)}

						{/* Time Fare */}
						{quote.timeFare > 0 && (
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Time Fare ({formatDuration(quote.estimatedDuration)})
								</span>
								<span className="font-medium text-sm">
									{formatPrice(quote.timeFare)}
								</span>
							</div>
						)}

						{/* Extra Charges */}
						{quote.extraCharges > 0 && (
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Extra Charges
								</span>
								<span className="font-medium text-amber-600 text-sm">
									+{formatPrice(quote.extraCharges)}
								</span>
							</div>
						)}

						<Separator />

						{/* Total */}
						<div className="flex items-center justify-between">
							<span className="font-semibold">Total Fare</span>
							<span className="font-bold text-green-600 text-lg">
								{formatPrice(quote.totalAmount)}
							</span>
						</div>

						{/* Pricing Details */}
						{quote.breakdown && (
							<div className="mt-4 space-y-2 border-t pt-4">
								<p className="font-medium text-muted-foreground text-xs">
									Pricing Details:
								</p>
								<div className="space-y-1">
									{quote.breakdown.baseRate > 0 && (
										<div className="flex items-center justify-between text-xs">
											<span className="text-muted-foreground">Base Rate</span>
											<span>{formatPrice(quote.breakdown.baseRate)}</span>
										</div>
									)}
									{quote.breakdown.perKmRate > 0 && (
										<div className="flex items-center justify-between text-xs">
											<span className="text-muted-foreground">Per KM Rate</span>
											<span>{formatPrice(quote.breakdown.perKmRate)}/km</span>
										</div>
									)}
									{quote.breakdown.perMinuteRate > 0 && (
										<div className="flex items-center justify-between text-xs">
											<span className="text-muted-foreground">
												Per Minute Rate
											</span>
											<span>
												{formatPrice(quote.breakdown.perMinuteRate)}/min
											</span>
										</div>
									)}
									{quote.breakdown.minimumFare > 0 && (
										<div className="flex items-center justify-between text-xs">
											<span className="text-muted-foreground">
												Minimum Fare
											</span>
											<span>{formatPrice(quote.breakdown.minimumFare)}</span>
										</div>
									)}
									{quote.breakdown.surgePricing &&
										quote.breakdown.surgePricing > 1 && (
											<div className="flex items-center justify-between text-xs">
												<span className="text-muted-foreground">
													Surge Pricing
												</span>
												<Badge variant="destructive" className="text-xs">
													{quote.breakdown.surgePricing}x
												</Badge>
											</div>
										)}
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Trip Information */}
			{formData && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<Clock className="h-4 w-4 text-blue-600" />
							Trip Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{formData.scheduledPickupDate && formData.scheduledPickupTime && (
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-sm">
										Pickup Time
									</span>
									<span className="font-medium text-sm">
										{formData.scheduledPickupDate} at{" "}
										{formData.scheduledPickupTime}
									</span>
								</div>
							)}
							{formData.passengerCount && (
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-sm">
										Passengers
									</span>
									<span className="font-medium text-sm">
										{formData.passengerCount}
									</span>
								</div>
							)}
							{formData.luggageCount !== undefined &&
								formData.luggageCount > 0 && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground text-sm">
											Luggage
										</span>
										<span className="font-medium text-sm">
											{formData.luggageCount} pieces
										</span>
									</div>
								)}
							{formData.customerName && (
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-sm">
										Customer
									</span>
									<span className="font-medium text-sm">
										{formData.customerName}
									</span>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
