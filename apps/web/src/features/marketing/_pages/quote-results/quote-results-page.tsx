import { useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { 
	ArrowLeft, 
	Car, 
	Users, 
	MapPin, 
	ChevronDown, 
	ChevronRight, 
	LogIn,
	Loader2
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { authClient } from "@/lib/auth-client";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useGetPublishedCarsQuery } from "@/features/customer/_hooks/query/use-get-published-cars-query";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

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
	// Additional fields for secure quote
	quoteId?: string
	originAddress?: string
	destinationAddress?: string
	carId?: string
	stops?: Array<{ address: string }>
}

interface QuoteResultsPageProps {
	isCustomerArea?: boolean;
}

export function QuoteResultsPage({ isCustomerArea = false }: QuoteResultsPageProps) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as any;
	const [showBreakdown, setShowBreakdown] = useState(false);
	const [quote, setQuote] = useState<QuoteResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	
	const { session, isPending: userLoading } = useUserQuery();

	// Fetch quote details using the secure quote ID - using manual approach due to type issues
	const { data: quoteData, isLoading: quoteLoading, error: quoteError } = useQuery({
		queryKey: ["instantQuote.getQuoteById", search.quoteId],
		queryFn: async () => {
			const response = await fetch(`http://localhost:3000/trpc/instantQuote.getQuoteById?batch=1&input=${encodeURIComponent(JSON.stringify({ "0": { quoteId: search.quoteId } }))}`);
			const data = await response.json();
			return data[0].result.data;
		},
		enabled: !!search.quoteId,
	});

	// Get car details if we have a carId  
	const { data: carsData } = useGetPublishedCarsQuery({ 
		limit: 50 
	});

	useEffect(() => {
		if (quoteData) {
			setQuote(quoteData as QuoteResult);
			setIsLoading(false);
		}
	}, [quoteData]);

	const selectedCar = quote?.carId && carsData?.data ? 
		carsData.data.find(car => car.id === quote.carId) : null;


	const handleBookAuthenticated = () => {
		if (!quote) return;
		
		if (session?.user) {
			// User is authenticated - route to book-quote
			navigate({
				to: "/book-quote/$quoteId",
				params: { quoteId: search.quoteId }
			});
		} else {
			// User not authenticated, redirect to sign-in with appropriate redirect
			const redirectPath = `/book-quote/${search.quoteId}`;
				
			navigate({
				to: "/sign-in",
				search: { redirect: redirectPath }
			});
		}
	};

	// Loading state
	if (isLoading || quoteLoading || userLoading) {
		return (
			<div className="min-h-screen bg-background">
				<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => navigate({ to: "/" })}
									className="gap-2"
								>
									<ArrowLeft className="w-4 h-4" />
									Back to Quote
								</Button>
								<div className="hidden sm:block h-6 w-px bg-border" />
								<div className="hidden sm:block">
									<h1 className="text-lg font-semibold">Quote Results</h1>
									<p className="text-sm text-muted-foreground">Your estimated fare</p>
								</div>
							</div>
							<div className="sm:hidden">
								<h1 className="text-lg font-semibold">Quote Results</h1>
							</div>
						</div>
					</div>
				</div>

				<div className="container mx-auto px-4 py-8">
					<div className="max-w-2xl mx-auto">
						<Card>
							<CardContent className="p-8">
								<div className="text-center space-y-4">
									<Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
									<div>
										<h3 className="text-lg font-semibold">Loading Quote Details</h3>
										<p className="text-sm text-muted-foreground">Please wait while we retrieve your quote information...</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (quoteError || !quote) {
		return (
			<div className="min-h-screen bg-background">
				<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => navigate({ to: "/" })}
									className="gap-2"
								>
									<ArrowLeft className="w-4 h-4" />
									Back to Quote
								</Button>
								<div className="hidden sm:block h-6 w-px bg-border" />
								<div className="hidden sm:block">
									<h1 className="text-lg font-semibold">Quote Results</h1>
									<p className="text-sm text-muted-foreground">Quote not found</p>
								</div>
							</div>
							<div className="sm:hidden">
								<h1 className="text-lg font-semibold">Quote Error</h1>
							</div>
						</div>
					</div>
				</div>

				<div className="container mx-auto px-4 py-8">
					<div className="max-w-2xl mx-auto">
						<Alert>
							<AlertDescription>
								Unable to load quote details. This quote may have expired or the link is invalid. 
								Please try generating a new quote.
							</AlertDescription>
						</Alert>
						<div className="mt-6 text-center">
							<Button onClick={() => navigate({ to: "/" })}>
								Get New Quote
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate({ to: "/" })}
								className="gap-2"
							>
								<ArrowLeft className="w-4 h-4" />
								Back to Quote
							</Button>
							<div className="hidden sm:block h-6 w-px bg-border" />
							<div className="hidden sm:block">
								<h1 className="text-lg font-semibold">Quote Results</h1>
								<p className="text-sm text-muted-foreground">Your estimated fare</p>
							</div>
						</div>

						{/* Mobile title */}
						<div className="sm:hidden">
							<h1 className="text-lg font-semibold">Quote Results</h1>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-6">
				<div className="max-w-2xl mx-auto space-y-6">
					{/* Trip Summary */}
					<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
						<CardContent className="p-4">
							<h3 className="font-medium mb-3 text-sm flex items-center gap-2">
								<MapPin className="h-4 w-4 text-primary" />
								Your Journey
							</h3>
							
							{/* Route Visual Display */}
							<div className="space-y-3">
								{/* Origin */}
								<div className="flex items-start gap-3 text-xs">
									<div className="relative mt-1">
										<div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm flex-shrink-0" />
										{/* Connector line for stops or destination */}
										{((quote.stops && quote.stops.length > 0) || quote.destinationAddress) && (
											<div className="absolute left-1/2 top-3 w-px h-6 bg-gradient-to-b from-green-500 to-gray-300 transform -translate-x-1/2"></div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-gray-900">From</div>
										<div className="text-muted-foreground text-xs leading-tight break-words">{quote.originAddress}</div>
									</div>
								</div>
								
								{/* Stops */}
								{quote.stops && quote.stops.length > 0 && quote.stops.map((stop, index) => (
									<div key={index} className="flex items-start gap-3 text-xs">
										<div className="relative mt-1">
											<div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow-sm flex-shrink-0" />
											{/* Connector line to next stop or destination */}
											<div className="absolute left-1/2 top-3 w-px h-6 bg-gradient-to-b from-orange-500 to-gray-300 transform -translate-x-1/2"></div>
										</div>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-gray-900">Stop {index + 1}</div>
											<div className="text-muted-foreground text-xs leading-tight break-words">{stop.address}</div>
										</div>
									</div>
								))}
								
								{/* Destination */}
								<div className="flex items-start gap-3 text-xs">
									<div className="relative mt-1">
										<div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm flex-shrink-0" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-gray-900">To</div>
										<div className="text-muted-foreground text-xs leading-tight break-words">{quote.destinationAddress}</div>
									</div>
								</div>
							</div>
							
							{/* Route Status Indicator */}
							<div className="absolute top-2 right-2">
								<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
							</div>
						</CardContent>
					</Card>

					{/* Journey Info */}
					<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
						<MapPin className="h-3 w-3" />
						<span>
							{(quote.estimatedDistance / 1000).toFixed(1)} km • {Math.round(quote.estimatedDuration / 60)} min journey
						</span>
					</div>

					{/* Selected Car Information */}
					{selectedCar && (
						<Card>
							<CardContent className="p-4">
								<h3 className="font-medium mb-3 text-sm flex items-center gap-2 text-blue-900">
									<Car className="h-4 w-4" />
									Selected Vehicle
								</h3>
								<div className="flex items-center gap-3">
									{selectedCar.images && selectedCar.images.length > 0 && (
										<img
											src={selectedCar.images.find(img => img.isMain)?.url || selectedCar.images[0].url}
											alt={selectedCar.name}
											className="w-16 h-12 object-cover rounded border"
										/>
									)}
									<div className="flex-1 min-w-0">
										<div className="font-medium text-sm text-gray-900">
											{selectedCar.name}
										</div>
										<div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
											<span className="flex items-center gap-1">
												<Users className="h-3 w-3" />
												{selectedCar.seatingCapacity} seats
											</span>
											<span>{selectedCar.category?.name}</span>
											<span>{selectedCar.fuelType?.name}</span>
										</div>
										{selectedCar.features && selectedCar.features.length > 0 && (
											<div className="flex flex-wrap gap-1 mt-1">
												{selectedCar.features.slice(0, 2).map((feature: any) => (
													<Badge key={feature.id} variant="secondary" className="text-xs px-1 py-0">
														{feature.name}
													</Badge>
												))}
												{selectedCar.features.length > 2 && (
													<Badge variant="secondary" className="text-xs px-1 py-0">
														+{selectedCar.features.length - 2} more
													</Badge>
												)}
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Estimated Fare Display */}
					<Card>
						<CardContent className="p-4">
							<div className="flex justify-between items-center font-bold text-lg mb-2">
								<span>Estimated Fare</span>
								<span className="text-primary">${quote.totalAmount.toFixed(2)}</span>
							</div>

							{/* Collapsible Cost Breakdown */}
							<button
								onClick={() => setShowBreakdown(!showBreakdown)}
								className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
										<span>${quote.baseFare.toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-xs">
										<span>Distance fare ({(quote.estimatedDistance / 1000).toFixed(1)} km)</span>
										<span>${quote.distanceFare.toFixed(2)}</span>
									</div>
									{quote.extraCharges > 0 && (
										<div className="flex justify-between text-xs">
											<span>Additional charges</span>
											<span>${quote.extraCharges.toFixed(2)}</span>
										</div>
									)}
									{quote.breakdown?.surgePricing && quote.breakdown.surgePricing > 1 && (
										<div className="flex justify-between text-xs text-orange-600">
											<span>Peak time surcharge ({((quote.breakdown.surgePricing - 1) * 100).toFixed(0)}%)</span>
											<span>Applied</span>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="space-y-3 pb-6">
						{session?.user ? (
							// User is authenticated - show only account booking
							<Button 
								onClick={handleBookAuthenticated}
								className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
							>
								Book
								<LogIn className="ml-2 h-5 w-5" />
							</Button>
						) : (
							// User is not authenticated - only show sign in option
							<Button 
								onClick={handleBookAuthenticated}
								className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
							>
								Sign In & Book
								<LogIn className="ml-2 h-5 w-5" />
							</Button>
						)}

						<Button 
							variant="outline" 
							onClick={() => navigate({ to: "/" })} 
							className="w-full h-10 text-sm"
						>
							Get New Quote
						</Button>
					</div>

					<div className="space-y-2 text-center">
						<p className="text-xs text-muted-foreground">
							* Prices are estimates and may vary based on traffic and other factors
						</p>
						<p className="text-xs text-primary">
							Sign in required to complete booking
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}