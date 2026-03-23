import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	ArrowLeft,
	Car,
	ChevronDown,
	ChevronRight,
	Loader2,
	LogIn,
	MapPin,
	User,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useGetPublishedCarsQuery } from "@/features/customer/_hooks/query/use-get-published-cars-query";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/trpc";
import { formatDistanceKm } from "@/utils/format";

interface QuoteResult {
	firstKmFare: number;
	additionalKmFare: number;
	totalAmount: number;
	estimatedDistance: number;
	estimatedDuration: number;
	breakdown: {
		firstKmRate: number;
		additionalKmRate: number;
		totalDistance: number;
		firstKmDistance: number;
		additionalDistance: number;
	};
	// Additional fields for secure quote
	quoteId?: string;
	originAddress?: string;
	destinationAddress?: string;
	carId?: string;
	stops?: Array<{ address: string }>;
}

interface QuoteResultsPageProps {
	isCustomerArea?: boolean;
}

export function QuoteResultsPage({
	isCustomerArea = false,
}: QuoteResultsPageProps) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as any;
	const [showBreakdown, setShowBreakdown] = useState(false);
	const [quote, setQuote] = useState<QuoteResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const { session, isPending: userLoading } = useUserQuery();

	// Fetch quote details using the secure quote ID - using manual approach due to type issues
	const {
		data: quoteData,
		isLoading: quoteLoading,
		error: quoteError,
	} = useQuery(
		trpc.instantQuote.getQuoteById.queryOptions({
			quoteId: search.quoteId,
		}),
	);

	// Get car details if we have a carId
	const { data: carsData } = useGetPublishedCarsQuery({
		limit: 50,
	});

	useEffect(() => {
		if (quoteData) {
			setQuote(quoteData as QuoteResult);
			setIsLoading(false);
		}
	}, [quoteData]);

	const selectedCar =
		quote?.carId && carsData?.data
			? carsData.data.find((car) => car.id === quote.carId)
			: null;

	const handleSignInAndBook = () => {
		if (!quote) return;
		const redirectPath = `/book-quote/${search.quoteId}`;
		navigate({
			to: "/sign-in",
			search: { redirect: redirectPath },
			resetScroll: true,
		});
	};

	const handleBookAuthenticated = () => {
		if (!quote) return;
		navigate({
			to: "/book-quote/$quoteId",
			params: { quoteId: search.quoteId },
			resetScroll: true,
		});
	};

	// Loading state
	if (isLoading || quoteLoading || userLoading) {
		return (
			<div className="min-h-screen bg-background">
				<div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => navigate({ to: "/", resetScroll: true })}
									className="gap-2"
								>
									<ArrowLeft className="h-4 w-4" />
									Back to Quote
								</Button>
								<div className="hidden h-6 w-px bg-border sm:block" />
								<div className="hidden sm:block">
									<h1 className="font-semibold text-lg">Quote Results</h1>
									<p className="text-muted-foreground text-sm">
										Your estimated fare
									</p>
								</div>
							</div>
							<div className="sm:hidden">
								<h1 className="font-semibold text-lg">Quote Results</h1>
							</div>
						</div>
					</div>
				</div>

				<div className="container mx-auto px-4 py-8">
					<div className="mx-auto max-w-2xl">
						<Card>
							<CardContent className="p-8">
								<div className="space-y-4 text-center">
									<Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
									<div>
										<h3 className="font-semibold text-lg">
											Loading Quote Details
										</h3>
										<p className="text-muted-foreground text-sm">
											Please wait while we retrieve your quote information...
										</p>
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
				<div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => navigate({ to: "/", resetScroll: true })}
									className="gap-2"
								>
									<ArrowLeft className="h-4 w-4" />
									Back to Quote
								</Button>
								<div className="hidden h-6 w-px bg-border sm:block" />
								<div className="hidden sm:block">
									<h1 className="font-semibold text-lg">Quote Results</h1>
									<p className="text-muted-foreground text-sm">
										Quote not found
									</p>
								</div>
							</div>
							<div className="sm:hidden">
								<h1 className="font-semibold text-lg">Quote Error</h1>
							</div>
						</div>
					</div>
				</div>

				<div className="container mx-auto px-4 py-8">
					<div className="mx-auto max-w-2xl">
						<Alert>
							<AlertDescription>
								Unable to load quote details. This quote may have expired or the
								link is invalid. Please try generating a new quote.
							</AlertDescription>
						</Alert>
						<div className="mt-6 text-center">
							<Button onClick={() => navigate({ to: "/", resetScroll: true })}>
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
			<div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate({ to: "/", resetScroll: true })}
								className="gap-2"
							>
								<ArrowLeft className="h-4 w-4" />
								Back to Quote
							</Button>
							<div className="hidden h-6 w-px bg-border sm:block" />
							<div className="hidden sm:block">
								<h1 className="font-semibold text-lg">Quote Results</h1>
								<p className="text-muted-foreground text-sm">
									Your estimated fare
								</p>
							</div>
						</div>

						{/* Mobile title */}
						<div className="sm:hidden">
							<h1 className="font-semibold text-lg">Quote Results</h1>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-6">
				<div className="mx-auto max-w-2xl space-y-6">
					{/* Trip Summary */}
					<Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
						<CardContent className="p-4">
							<h3 className="mb-3 flex items-center gap-2 font-medium text-sm">
								<MapPin className="h-4 w-4 text-primary" />
								Your Journey
							</h3>

							{/* Route Visual Display */}
							<div className="space-y-3">
								{/* Origin */}
								<div className="flex items-start gap-3 text-xs">
									<div className="relative mt-1">
										<div className="h-3 w-3 flex-shrink-0 rounded-full border-2 border-white bg-green-500 shadow-sm" />
										{/* Connector line for stops or destination */}
										{((quote.stops && quote.stops.length > 0) ||
											quote.destinationAddress) && (
											<div className="-translate-x-1/2 absolute top-3 left-1/2 h-6 w-px transform bg-gradient-to-b from-green-500 to-gray-300" />
										)}
									</div>
									<div className="min-w-0 flex-1">
										<div className="font-medium text-gray-900">From</div>
										<div className="break-words text-muted-foreground text-xs leading-tight">
											{quote.originAddress}
										</div>
									</div>
								</div>

								{/* Stops */}
								{quote.stops &&
									quote.stops.length > 0 &&
									quote.stops.map((stop, index) => (
										<div key={index} className="flex items-start gap-3 text-xs">
											<div className="relative mt-1">
												<div className="h-3 w-3 flex-shrink-0 rounded-full border-2 border-white bg-orange-500 shadow-sm" />
												{/* Connector line to next stop or destination */}
												<div className="-translate-x-1/2 absolute top-3 left-1/2 h-6 w-px transform bg-gradient-to-b from-orange-500 to-gray-300" />
											</div>
											<div className="min-w-0 flex-1">
												<div className="font-medium text-gray-900">
													Stop {index + 1}
												</div>
												<div className="break-words text-muted-foreground text-xs leading-tight">
													{stop.address}
												</div>
											</div>
										</div>
									))}

								{/* Destination */}
								<div className="flex items-start gap-3 text-xs">
									<div className="relative mt-1">
										<div className="h-3 w-3 flex-shrink-0 rounded-full border-2 border-white bg-red-500 shadow-sm" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="font-medium text-gray-900">To</div>
										<div className="break-words text-muted-foreground text-xs leading-tight">
											{quote.destinationAddress}
										</div>
									</div>
								</div>
							</div>

							{/* Route Status Indicator */}
							<div className="absolute top-2 right-2">
								<div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
							</div>
						</CardContent>
					</Card>

					{/* Journey Info */}
					<div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-muted-foreground text-xs">
						<MapPin className="h-3 w-3" />
						<span>
							{formatDistanceKm(quote.estimatedDistance)} •{" "}
							{Math.round((quote.estimatedDuration || 0) / 60)} min journey
						</span>
					</div>

					{/* Selected Car Information */}
					{selectedCar && (
						<Card>
							<CardContent className="p-4">
								<h3 className="mb-3 flex items-center gap-2 font-medium text-blue-900 text-sm">
									<Car className="h-4 w-4" />
									Selected Vehicle
								</h3>
								<div className="flex items-center gap-3">
									{selectedCar.images && selectedCar.images.length > 0 && (
										<img
											src={
												selectedCar.images.find((img: any) => img.isMain)
													?.url || selectedCar.images[0].url
											}
											alt={selectedCar.name}
											className="h-12 w-16 rounded border object-cover"
										/>
									)}
									<div className="min-w-0 flex-1">
										<div className="font-medium text-gray-900 text-sm">
											{selectedCar.name}
										</div>
										<div className="mt-1 flex items-center gap-3 text-muted-foreground text-xs">
											<span className="flex items-center gap-1">
												<Users className="h-3 w-3" />
												{selectedCar.seatingCapacity} seats
											</span>
											<span>{selectedCar.category?.name}</span>
											<span>{selectedCar.fuelType?.name}</span>
										</div>
										{selectedCar.features &&
											selectedCar.features.length > 0 && (
												<div className="mt-1 flex flex-wrap gap-1">
													{selectedCar.features
														.slice(0, 2)
														.map((feature: any) => (
															<Badge
																key={feature.id}
																variant="secondary"
																className="px-1 py-0 text-xs"
															>
																{feature.name}
															</Badge>
														))}
													{selectedCar.features.length > 2 && (
														<Badge
															variant="secondary"
															className="px-1 py-0 text-xs"
														>
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
							<div className="mb-2 flex items-center justify-between font-bold text-lg">
								<span>Estimated Fare</span>
								<span className="text-primary">
									${(quote.totalAmount || 0).toFixed(2)}
								</span>
							</div>

							{/* Collapsible Cost Breakdown */}
							{quote.breakdown && (
								<button
									onClick={() => setShowBreakdown(!showBreakdown)}
									className="flex items-center gap-2 text-muted-foreground text-xs transition-colors hover:text-foreground"
								>
									{showBreakdown ? (
										<ChevronDown className="h-3 w-3" />
									) : (
										<ChevronRight className="h-3 w-3" />
									)}
									View breakdown
								</button>
							)}

							{showBreakdown && quote.breakdown && (
								<div className="mt-2 space-y-1 border-t pt-2">
									<div className="flex justify-between text-xs">
										<span>
											First {Math.ceil(quote.breakdown.firstKmDistance || 10)}km
											(Flat Rate)
										</span>
										<span>${(quote.firstKmFare || 0).toFixed(2)}</span>
									</div>
									{(quote.breakdown.additionalDistance || 0) > 0 && (
										<div className="flex justify-between text-xs">
											<span>
												Additional{" "}
												{(quote.breakdown.additionalDistance || 0).toFixed(1)}km
												× ${(quote.breakdown.additionalKmRate || 0).toFixed(2)}
												/km
											</span>
											<span>${(quote.additionalKmFare || 0).toFixed(2)}</span>
										</div>
									)}
									{(quote.breakdown.additionalDistance || 0) === 0 && (
										<div className="mt-2 rounded-md bg-blue-50 p-2">
											<p className="text-blue-800 text-xs">
												<strong>Within flat rate limit:</strong> No additional
												charges since your{" "}
												{Number(quote.estimatedDistance || 0).toFixed(1)}km
												journey is within the first{" "}
												{Math.ceil(quote.breakdown.firstKmDistance || 10)}km
												tier.
											</p>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="space-y-3 pb-6">
						{session?.user ? (
							// User is authenticated - show book button
							<Button
								onClick={handleBookAuthenticated}
								className="h-12 w-full bg-primary font-semibold text-base hover:bg-primary/90"
							>
								Book
								<ChevronRight className="ml-2 h-5 w-5" />
							</Button>
						) : (
							// User is not authenticated - show sign in OR continue as guest
							<>
								<Button
									onClick={handleSignInAndBook}
									className="h-12 w-full bg-primary font-semibold text-base hover:bg-primary/90"
								>
									<LogIn className="mr-2 h-5 w-5" />
									Sign In & Book
								</Button>
								<Button
									asChild
									variant="outline"
									className="h-12 w-full font-semibold text-base"
								>
									<Link
										to="/book-quote/$quoteId"
										params={{ quoteId: search.quoteId }}
										search={{ guest: "1" }}
										resetScroll
									>
										<User className="mr-2 h-5 w-5" />
										Continue as Guest
									</Link>
								</Button>
							</>
						)}

						<Button
							variant="outline"
							onClick={() => navigate({ to: "/", resetScroll: true })}
							className="h-10 w-full text-sm"
						>
							Get New Quote
						</Button>
					</div>

					<div className="space-y-2 text-center">
						<p className="text-muted-foreground text-xs">
							* Prices are estimates and may vary based on traffic and other
							factors
						</p>
						{!session?.user && (
							<p className="text-muted-foreground text-xs">
								Sign in or create an account to complete your booking
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
