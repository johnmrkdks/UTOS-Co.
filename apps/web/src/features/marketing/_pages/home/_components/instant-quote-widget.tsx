import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Calculator, MapPin } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { GooglePlacesInput } from "./google-places-input-simple"

const instantQuoteSchema = z.object({
	originAddress: z.string().min(1, "Origin address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
})

type InstantQuoteForm = z.infer<typeof instantQuoteSchema>

interface QuoteResult {
	baseFare: number
	distanceFare: number
	timeFare: number
	extraCharges: number
	totalAmount: number
	estimatedDistance: number
	estimatedDuration: number
	breakdown: {
		baseRate: number
		perKmRate: number
		perMinuteRate: number
		minimumFare: number
		surgePricing?: number
	}
}

export function InstantQuoteWidget() {
	const [quote, setQuote] = useState<QuoteResult | null>(null)
	const [isCalculating, setIsCalculating] = useState(false)

	const form = useForm({
		resolver: zodResolver(instantQuoteSchema),
		defaultValues: {
			originAddress: "",
			destinationAddress: "",
		},
	})

	const watchedValues = form.watch(["originAddress", "destinationAddress"])
	const canCalculateQuote = watchedValues[0] && watchedValues[1] && watchedValues[2]

	const handleCalculateQuote = () => {
		// Mock quote calculation - in real implementation, this would call the API
		setIsCalculating(true)

		// Simulate API call delay
		setTimeout(() => {
			const mockQuote: QuoteResult = {
				baseFare: 500,
				distanceFare: 1200,
				timeFare: 300,
				extraCharges: 0,
				totalAmount: 2000,
				estimatedDistance: 12000,
				estimatedDuration: 1800,
				breakdown: {
					baseRate: 500,
					perKmRate: 100,
					perMinuteRate: 10,
					minimumFare: 800,
				},
			}
			setQuote(mockQuote)
			setIsCalculating(false)
		}, 1500)
	}

	const resetQuote = () => {
		setQuote(null)
		form.reset()
	}

	return (
		<Card className="w-full max-w-2xl mx-auto shadow-lg">
			<CardHeader className="text-center">
				<CardTitle className="flex items-center justify-center gap-2 text-2xl">
					<Calculator className="h-6 w-6 text-primary" />
					Get Instant Quote
				</CardTitle>
				<CardDescription>
					Calculate your fare instantly for luxury chauffeur service across Australia. Available Mon-Sun 00:00 – 23:45
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={(e) => e.preventDefault()} className="space-y-6">
						{/* Trip Details */}
						<div className="space-y-8">
							<FormField
								control={form.control}
								name="originAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<MapPin className="h-4 w-4" />
											From (Origin)
										</FormLabel>
										<FormControl>
											<GooglePlacesInput
												value={field.value || ""}
												onChange={field.onChange}
												placeholder="Enter pickup location in Australia..."
												className="text-base"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="destinationAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<MapPin className="h-4 w-4" />
											To (Destination)
										</FormLabel>
										<FormControl>
											<GooglePlacesInput
												value={field.value || ""}
												onChange={field.onChange}
												placeholder="Enter destination in Australia..."
												className="text-base"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

						</div>

						{/* Quote Calculation Button */}
						<Button
							type="button"
							onClick={handleCalculateQuote}
							disabled={!canCalculateQuote || isCalculating}
							className="w-full h-12 text-base font-semibold"
							size="lg"
						>
							<Calculator className="mr-2 h-5 w-5" />
							{isCalculating ? "Calculating..." : "Estimate Fare"}
						</Button>

						{!canCalculateQuote && (
							<p className="text-xs text-muted-foreground text-center">
								* Regular Transfers Only - extras may apply
							</p>
						)}
					</form>
				</Form>

				{/* Quote Display */}
				{(isCalculating || quote) && (
					<div className="mt-6 pt-6 border-t">
						{isCalculating ? (
							<div className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-8 w-full" />
							</div>
						) : quote ? (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold">Your Quote</h3>
									<Button variant="ghost" size="sm" onClick={resetQuote}>
										New Quote
									</Button>
								</div>

								<div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
									<MapPin className="h-4 w-4" />
									<span>
										{(quote.estimatedDistance / 1000).toFixed(1)} km • {Math.round(quote.estimatedDuration / 60)} min journey
									</span>
								</div>

								<div className="space-y-2 bg-background border rounded-lg p-4">
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
									<div className="flex justify-between font-bold text-xl">
										<span>Total</span>
										<span className="text-primary">${(quote.totalAmount / 100).toFixed(2)}</span>
									</div>
								</div>

								{quote.breakdown.surgePricing && quote.breakdown.surgePricing > 1 && (
									<Badge variant="destructive" className="w-full justify-center">
										{((quote.breakdown.surgePricing - 1) * 100).toFixed(0)}% surge pricing
									</Badge>
								)}

								<div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-lg">
									<div className="font-medium mb-1">Rate breakdown:</div>
									<div>Base: ${(quote.breakdown.baseRate / 100).toFixed(2)}</div>
									<div>Per km: ${(quote.breakdown.perKmRate / 100).toFixed(2)}</div>
									<div>Per min: ${(quote.breakdown.perMinuteRate / 100).toFixed(2)}</div>
									<div>Min fare: ${(quote.breakdown.minimumFare / 100).toFixed(2)}</div>
								</div>

								<Button className="w-full h-12 text-base font-semibold" size="lg">
									Book This Journey
								</Button>

								<p className="text-xs text-muted-foreground text-center">
									* Prices are estimates and may vary based on traffic and other factors
								</p>
							</div>
						) : null}
					</div>
				)}
			</CardContent>
		</Card >
	)
}
