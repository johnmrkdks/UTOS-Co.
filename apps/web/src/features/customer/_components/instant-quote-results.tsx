import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
	MapPin,
	Calculator,
	Car,
	Route,
	Bookmark,
	ArrowRight,
	ArrowLeft,
	ChevronDown,
	ChevronRight
} from "lucide-react";
import { type QuoteResult, type RouteData } from "../_types/instant-quote";

interface InstantQuoteResultsProps {
	quote: QuoteResult;
	routeData: RouteData;
	onBookJourney: () => void;
	onGetNewQuote: () => void;
}

export function InstantQuoteResults({ 
	quote, 
	routeData, 
	onBookJourney, 
	onGetNewQuote 
}: InstantQuoteResultsProps) {
	const [showBreakdown, setShowBreakdown] = useState(false);

	return (
		<div className="space-y-4">
			{/* Route Summary */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Route className="h-5 w-5" />
						Journey Summary
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{/* Route visualization */}
						<div className="space-y-2">
							<div className="flex items-start gap-3">
								<div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
								<div className="flex-1">
									<div className="font-medium">From</div>
									<div className="text-muted-foreground">{routeData.originAddress}</div>
								</div>
							</div>

							{routeData.stops?.map((stop, index) => (
								<div key={stop.id} className="flex items-start gap-3 ml-1">
									<div className="w-1 h-8 bg-gray-300 ml-1" />
									<div className="flex-1 -mt-2">
										<div className="w-2 h-2 rounded-full bg-blue-500 mb-1" />
										<div className="text-sm">Stop {index + 1}</div>
										<div className="text-xs text-muted-foreground">{stop.address}</div>
									</div>
								</div>
							))}

							<div className="flex items-start gap-3">
								<div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
								<div className="flex-1">
									<div className="font-medium">To</div>
									<div className="text-muted-foreground">{routeData.destinationAddress}</div>
								</div>
							</div>
						</div>
					</div>

					{/* Journey Info */}
					<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg mt-4">
						<MapPin className="h-3 w-3" />
						<span>
							{(quote.estimatedDistance / 1000).toFixed(1)} km • {Math.round(quote.estimatedDuration / 60)} min journey
						</span>
					</div>
				</CardContent>
			</Card>

			{/* Fare Results */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5" />
						Your Fare Estimate
					</CardTitle>
					<CardDescription>
						Calculated fare breakdown
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Total Fare Display */}
					<div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
						<div className="flex justify-between items-center">
							<span className="text-lg font-semibold">Total Fare</span>
							<span className="text-2xl font-bold text-primary">${quote.totalAmount.toFixed(2)}</span>
						</div>

						{/* Always Visible Breakdown */}
						<div className="mt-4 pt-3 border-t border-primary/20 space-y-2">
							<div className="text-sm font-medium text-foreground mb-2">Price Breakdown:</div>
							
							{/* Base Fare */}
							<div className="flex justify-between items-center text-sm">
								<span className="text-muted-foreground">
									Base fare (first {quote.breakdown.firstKmDistance.toFixed(1)}km)
								</span>
								<span className="font-medium">${quote.firstKmFare.toFixed(2)}</span>
							</div>
							
							{/* Additional Distance Fare */}
							{quote.breakdown.additionalDistance > 0 ? (
								<div className="flex justify-between items-center text-sm">
									<span className="text-muted-foreground">
										Extra distance ({quote.breakdown.additionalDistance.toFixed(1)}km @ ${quote.breakdown.additionalKmRate.toFixed(2)}/km)
									</span>
									<span className="font-medium">${quote.additionalKmFare.toFixed(2)}</span>
								</div>
							) : (
								<div className="bg-green-50 border border-green-200 rounded-md p-2 mt-2">
									<p className="text-xs text-green-800">
										✓ <strong>Great news!</strong> Your {(quote.estimatedDistance / 1000).toFixed(1)}km journey is within the base rate - no extra distance charges apply.
									</p>
								</div>
							)}
							
							{/* Total Line */}
							<div className="flex justify-between items-center text-sm pt-2 border-t border-primary/20">
								<span className="font-semibold">Total Journey Cost</span>
								<span className="font-bold text-primary">${quote.totalAmount.toFixed(2)}</span>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col gap-2">
						<Button onClick={onBookJourney} className="w-full">
							<Car className="h-4 w-4 mr-2" />
							Book This Journey
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>

						<div className="grid grid-cols-2 gap-2">
							<Button variant="outline" onClick={onGetNewQuote}>
								Get New Quote
							</Button>
							<Button variant="outline">
								<Bookmark className="h-4 w-4 mr-2" />
								Save Route
							</Button>
						</div>
					</div>

					<p className="text-xs text-muted-foreground text-center">
						* Prices are estimates and may vary based on traffic and other factors
					</p>
				</CardContent>
			</Card>
		</div>
	);
}