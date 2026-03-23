import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	ArrowLeft,
	ArrowRight,
	Bookmark,
	Calculator,
	Car,
	ChevronDown,
	ChevronRight,
	MapPin,
	Route,
} from "lucide-react";
import { useState } from "react";
import { formatDistanceKm } from "@/utils/format";
import type { QuoteResult, RouteData } from "../_types/instant-quote";

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
	onGetNewQuote,
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
								<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-green-500" />
								<div className="flex-1">
									<div className="font-medium">From</div>
									<div className="text-muted-foreground">
										{routeData.originAddress}
									</div>
								</div>
							</div>

							{routeData.stops?.map((stop, index) => (
								<div key={stop.id} className="ml-1 flex items-start gap-3">
									<div className="ml-1 h-8 w-1 bg-gray-300" />
									<div className="-mt-2 flex-1">
										<div className="mb-1 h-2 w-2 rounded-full bg-blue-500" />
										<div className="text-sm">Stop {index + 1}</div>
										<div className="text-muted-foreground text-xs">
											{stop.address}
										</div>
									</div>
								</div>
							))}

							<div className="flex items-start gap-3">
								<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-red-500" />
								<div className="flex-1">
									<div className="font-medium">To</div>
									<div className="text-muted-foreground">
										{routeData.destinationAddress}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Journey Info */}
					<div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 p-2 text-muted-foreground text-xs">
						<MapPin className="h-3 w-3" />
						<span>
							{formatDistanceKm(quote.estimatedDistance)} •{" "}
							{Math.round(quote.estimatedDuration / 60)} min journey
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
					<CardDescription>Calculated fare breakdown</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Total Fare Display */}
					<div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
						<div className="flex items-center justify-between">
							<span className="font-semibold text-lg">Total Fare</span>
							<span className="font-bold text-2xl text-primary">
								${quote.totalAmount.toFixed(2)}
							</span>
						</div>

						{/* Always Visible Breakdown */}
						<div className="mt-4 space-y-2 border-primary/20 border-t pt-3">
							<div className="mb-2 font-medium text-foreground text-sm">
								Price Breakdown:
							</div>

							{/* Base Fare */}
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									Base fare (first {quote.breakdown.firstKmDistance.toFixed(1)}
									km)
								</span>
								<span className="font-medium">
									${quote.firstKmFare.toFixed(2)}
								</span>
							</div>

							{/* Additional Distance Fare */}
							{quote.breakdown.additionalDistance > 0 ? (
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">
										Extra distance (
										{quote.breakdown.additionalDistance.toFixed(1)}km @ $
										{quote.breakdown.additionalKmRate.toFixed(2)}/km)
									</span>
									<span className="font-medium">
										${quote.additionalKmFare.toFixed(2)}
									</span>
								</div>
							) : (
								<div className="mt-2 rounded-md border border-green-200 bg-green-50 p-2">
									<p className="text-green-800 text-xs">
										✓ <strong>Great news!</strong> Your{" "}
										{Number(quote.estimatedDistance).toFixed(1)}km journey is
										within the base rate - no extra distance charges apply.
									</p>
								</div>
							)}

							{/* Total Line */}
							<div className="flex items-center justify-between border-primary/20 border-t pt-2 text-sm">
								<span className="font-semibold">Total Journey Cost</span>
								<span className="font-bold text-primary">
									${quote.totalAmount.toFixed(2)}
								</span>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col gap-2">
						<Button onClick={onBookJourney} className="w-full">
							<Car className="mr-2 h-4 w-4" />
							Book This Journey
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>

						<div className="grid grid-cols-2 gap-2">
							<Button variant="outline" onClick={onGetNewQuote}>
								Get New Quote
							</Button>
							<Button variant="outline">
								<Bookmark className="mr-2 h-4 w-4" />
								Save Route
							</Button>
						</div>
					</div>

					<p className="text-center text-muted-foreground text-xs">
						* Prices are estimates and may vary based on traffic and other
						factors
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
