import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { Calculator, MapPin, Clock, DollarSign, Route, Navigation, CheckCircle } from "lucide-react"
import type { QuoteResult } from "../../_types/booking"
import type { EnhancedCustomBookingForm } from "./enhanced-custom-booking-form"
import { useGetPricingConfigsQuery } from "../../../pricing-config/_hooks/query/use-get-pricing-configs-query"

interface EnhancedQuoteDisplayProps {
	quote: QuoteResult | null
	isCalculating: boolean
	formData?: Partial<EnhancedCustomBookingForm>
	selectedCar?: {
		id: string
		name: string
		brand?: { name: string }
		model?: { name: string }
		category?: { name: string }
		features?: Array<{ name: string }>
	} | null
	onCalculateQuote?: () => void
	canCalculateQuote?: boolean
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
		limit: 1
	})
	const formatPrice = (price: number) => `$${price.toFixed(2)}`
	const formatDistance = (meters: number) => `${(meters / 1000).toFixed(1)} km`
	const formatDuration = (seconds: number) => {
		const minutes = Math.round(seconds / 60)
		const hours = Math.floor(minutes / 60)
		const remainingMinutes = minutes % 60

		if (hours > 0) {
			return `${hours}h ${remainingMinutes}m`
		}
		return `${minutes}m`
	}

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
							<div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
							<div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
							<div className="h-4 bg-muted rounded w-2/3"></div>
						</div>
						<Separator />
						<div className="animate-pulse">
							<div className="h-6 bg-muted rounded w-1/2"></div>
						</div>
					</div>
				</CardContent>
			</Card>
		)
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
							<p className="text-sm text-muted-foreground">
								Fill in the form fields to enable quote calculation
							</p>
							<Button
								onClick={() => {
									// Trigger the form's calculate quote button instead of calling onCalculateQuote directly
									const formCalcButton = document.querySelector('[data-form-calculate-quote]') as HTMLButtonElement;
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
						<div className="text-center py-8">
							<Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-sm text-muted-foreground">
								Calculate a quote to see pricing details
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		)
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
						<p className="text-sm text-muted-foreground">
							Current quote calculated successfully
						</p>
						<Button
							onClick={() => {
								// Trigger the form's calculate quote button instead of calling onCalculateQuote directly
								const formCalcButton = document.querySelector('[data-form-calculate-quote]') as HTMLButtonElement;
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
								<p className="text-sm text-muted-foreground">
									{selectedCar.brand.name} {selectedCar.model.name}
								</p>
							)}
							{selectedCar.features && selectedCar.features.length > 0 && (
								<div className="flex flex-wrap gap-1 mt-2">
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
								<div className="mt-3 pt-3 border-t">
									<h4 className="text-xs font-medium text-muted-foreground mb-2">PRICING RATES</h4>
									<div className="space-y-1">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">First {carPricing.data[0].firstKmLimit || 10}km:</span>
											<span className="font-medium">{formatPrice(carPricing.data[0].firstKmRate)}</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">Additional per km:</span>
											<span className="font-medium">{formatPrice(carPricing.data[0].pricePerKm)}/km</span>
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
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
								<div className="flex-1 min-w-0">
									<p className="text-xs font-medium text-green-700 mb-0.5">Pickup</p>
									<p className="text-xs text-muted-foreground leading-tight">
										{formData.originAddress || "Not specified"}
									</p>
								</div>
							</div>

							{/* Stops */}
							{formData.stops && formData.stops.length > 0 && (
								<>
									{formData.stops.map((stop, index) => (
										<div key={index}>
											<div className="border-l border-muted ml-1 h-2"></div>
											<div className="flex items-start gap-2">
												<div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-medium text-blue-700 mb-0.5">Stop {index + 1}</p>
													<p className="text-xs text-muted-foreground leading-tight">
														{stop.address}
													</p>
													{stop.waitingTime && stop.waitingTime > 0 && (
														<p className="text-xs text-amber-600">
															Wait: {stop.waitingTime} min
														</p>
													)}
												</div>
											</div>
										</div>
									))}
									<div className="border-l border-muted ml-1 h-2"></div>
								</>
							)}

							{/* Destination */}
							<div className="flex items-start gap-2">
								<div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
								<div className="flex-1 min-w-0">
									<p className="text-xs font-medium text-red-700 mb-0.5">Destination</p>
									<p className="text-xs text-muted-foreground leading-tight">
										{formData.destinationAddress || "Not specified"}
									</p>
								</div>
							</div>
						</div>

						{/* Trip Stats */}
						{quote && (
							<div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
								<div className="text-center">
									<div className="flex items-center justify-center gap-1 mb-1">
										<Navigation className="h-3 w-3 text-muted-foreground" />
										<span className="text-xs text-muted-foreground">Distance</span>
									</div>
									<p className="text-sm font-medium">
										{formatDistance(quote.estimatedDistance)}
									</p>
								</div>
								<div className="text-center">
									<div className="flex items-center justify-center gap-1 mb-1">
										<Clock className="h-3 w-3 text-muted-foreground" />
										<span className="text-xs text-muted-foreground">Duration</span>
									</div>
									<p className="text-sm font-medium">
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
								<span className="text-sm text-muted-foreground">Base Fare</span>
								<span className="text-sm font-medium">{formatPrice(quote.baseFare)}</span>
							</div>
						)}

						{/* Distance Fare */}
						{quote.distanceFare > 0 && (
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Distance Fare ({formatDistance(quote.estimatedDistance)})
								</span>
								<span className="text-sm font-medium">{formatPrice(quote.distanceFare)}</span>
							</div>
						)}

						{/* Time Fare */}
						{quote.timeFare > 0 && (
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Time Fare ({formatDuration(quote.estimatedDuration)})
								</span>
								<span className="text-sm font-medium">{formatPrice(quote.timeFare)}</span>
							</div>
						)}

						{/* Extra Charges */}
						{quote.extraCharges > 0 && (
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Extra Charges</span>
								<span className="text-sm font-medium text-amber-600">
									+{formatPrice(quote.extraCharges)}
								</span>
							</div>
						)}

						<Separator />

						{/* Total */}
						<div className="flex items-center justify-between">
							<span className="font-semibold">Total Fare</span>
							<span className="text-lg font-bold text-green-600">
								{formatPrice(quote.totalAmount)}
							</span>
						</div>

						{/* Pricing Details */}
						{quote.breakdown && (
							<div className="mt-4 pt-4 border-t space-y-2">
								<p className="text-xs font-medium text-muted-foreground">Pricing Details:</p>
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
											<span className="text-muted-foreground">Per Minute Rate</span>
											<span>{formatPrice(quote.breakdown.perMinuteRate)}/min</span>
										</div>
									)}
									{quote.breakdown.minimumFare > 0 && (
										<div className="flex items-center justify-between text-xs">
											<span className="text-muted-foreground">Minimum Fare</span>
											<span>{formatPrice(quote.breakdown.minimumFare)}</span>
										</div>
									)}
									{quote.breakdown.surgePricing && quote.breakdown.surgePricing > 1 && (
										<div className="flex items-center justify-between text-xs">
											<span className="text-muted-foreground">Surge Pricing</span>
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
									<span className="text-sm text-muted-foreground">Pickup Time</span>
									<span className="text-sm font-medium">
										{formData.scheduledPickupDate} at {formData.scheduledPickupTime}
									</span>
								</div>
							)}
							{formData.passengerCount && (
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Passengers</span>
									<span className="text-sm font-medium">{formData.passengerCount}</span>
								</div>
							)}
							{formData.luggageCount !== undefined && formData.luggageCount > 0 && (
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Luggage</span>
									<span className="text-sm font-medium">{formData.luggageCount} pieces</span>
								</div>
							)}
							{formData.customerName && (
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Customer</span>
									<span className="text-sm font-medium">{formData.customerName}</span>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}