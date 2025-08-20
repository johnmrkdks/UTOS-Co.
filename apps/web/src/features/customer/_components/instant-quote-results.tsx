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
					<div className="bg-background border rounded-lg p-3">
						<div className="flex justify-between items-center font-bold text-lg">
							<span>Total Fare</span>
							<span className="text-primary">${(quote.totalAmount / 100).toFixed(2)}</span>
						</div>

						{/* Collapsible Cost Breakdown */}
						<button
							onClick={() => setShowBreakdown(!showBreakdown)}
							className="flex items-center gap-2 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
						>
							{showBreakdown ? (
								<ChevronDown className="h-3 w-3" />
							) : (
								<ChevronRight className="h-3 w-3" />
							)}
							View breakdown
						</button>

						{showBreakdown && (
							<div className="mt-2 pt-2 border-t space-y-1">
								<div className="flex justify-between text-xs">
									<span>Base fare</span>
									<span>${(quote.baseFare / 100).toFixed(2)}</span>
								</div>
								<div className="flex justify-between text-xs">
									<span>Distance fare</span>
									<span>${(quote.distanceFare / 100).toFixed(2)}</span>
								</div>
								{quote.extraCharges > 0 && (
									<div className="flex justify-between text-xs">
										<span>Extra charges</span>
										<span>${(quote.extraCharges / 100).toFixed(2)}</span>
									</div>
								)}
							</div>
						)}
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