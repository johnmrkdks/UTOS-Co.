import { Calculator, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { QuoteResult } from "../../_types/booking"

interface QuoteDisplayProps {
	quote: QuoteResult | null
	isCalculating: boolean
}

export function QuoteDisplay({ quote, isCalculating }: QuoteDisplayProps) {
	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calculator className="h-5 w-5" />
					Instant Quote
				</CardTitle>
				<CardDescription>Calculate pricing based on route and time</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{isCalculating ? (
					<div className="space-y-3">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-8 w-full" />
					</div>
				) : quote ? (
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<MapPin className="h-4 w-4" />
							<span>
								{(quote.estimatedDistance / 1000).toFixed(1)} km • {Math.round(quote.estimatedDuration / 60)} min
							</span>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Base fare</span>
								<span>${(quote.baseFare / 100).toFixed(2)}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>Distance fare</span>
								<span>${(quote.distanceFare / 100).toFixed(2)}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>Time fare</span>
								<span>${(quote.timeFare / 100).toFixed(2)}</span>
							</div>
							{quote.extraCharges > 0 && (
								<div className="flex justify-between text-sm">
									<span>Extra charges</span>
									<span>${(quote.extraCharges / 100).toFixed(2)}</span>
								</div>
							)}
							<hr className="my-2" />
							<div className="flex justify-between font-semibold text-lg">
								<span>Total</span>
								<span className="text-primary">${quote.totalAmount.toFixed(2)}</span>
							</div>
						</div>

						{quote.breakdown.surgePricing && quote.breakdown.surgePricing > 1 && (
							<Badge variant="destructive" className="w-full justify-center">
								{((quote.breakdown.surgePricing - 1) * 100).toFixed(0)}% surge pricing
							</Badge>
						)}

						<div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
							<div className="font-medium mb-1">Rate breakdown:</div>
							<div>Base: ${(quote.breakdown.baseRate / 100).toFixed(2)}</div>
							<div>Per km: ${(quote.breakdown.perKmRate / 100).toFixed(2)}</div>
							<div>Per min: ${(quote.breakdown.perMinuteRate / 100).toFixed(2)}</div>
							<div>Min fare: ${(quote.breakdown.minimumFare / 100).toFixed(2)}</div>
						</div>
					</div>
				) : (
					<div className="text-center text-muted-foreground py-8">
						<Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p className="text-sm">Enter route details and click "Calculate Quote" to see pricing</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

