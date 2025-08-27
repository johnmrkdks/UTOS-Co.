import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { 
	ArrowLeft, 
	Clock, 
	Users, 
	MapPin, 
	Calendar,
	Phone,
	Mail,
	User,
	Loader2,
	Package,
	CheckCircle,
	AlertCircle,
	Car,
	Calculator
} from "lucide-react";
import { toast } from "sonner";
import { Link, useSearch, useNavigate } from "@tanstack/react-router";
import { useUnifiedUserQuery, extractUserInfo } from "@/hooks/query/use-unified-user-query";
import { useGetAvailableCarsQuery } from "@/features/customer/_hooks/query/use-get-available-cars-query";
import { useCreateCustomBookingFromQuoteMutation } from "@/features/marketing/_hooks/query/use-create-custom-booking-from-quote-mutation";
import { getOrCreateGuestSession } from "@/utils/auth";
import { z } from "zod";

// Booking form schema for quote-based booking
const QuoteBookingFormSchema = z.object({
	scheduledPickupDate: z.string().min(1, "Pickup date is required"),
	scheduledPickupTime: z.string().min(1, "Pickup time is required"),
	customerName: z.string().min(1, "Name is required"),
	customerPhone: z.string().min(1, "Phone number is required"),
	customerEmail: z.string().email("Valid email required"),
	passengerCount: z.number().min(1, "At least 1 passenger required"),
	specialRequests: z.string().optional(),
});

type QuoteBookingFormData = z.infer<typeof QuoteBookingFormSchema>;

export function QuoteBookingPage() {
	const search = useSearch({ strict: false }) as any;
	const navigate = useNavigate();
	
	// Use unified user query that handles both authenticated and guest users
	const { data: sessionData, isLoading: sessionLoading } = useUnifiedUserQuery();
	const userInfo = extractUserInfo(sessionData);
	
	// Fetch available cars
	const { data: carsData, isLoading: carsLoading, error: carsError } = useGetAvailableCarsQuery();
	
	// Mutation for creating booking from quote
	const createBookingMutation = useCreateCustomBookingFromQuoteMutation();
	
	// Form state - pre-populate with user info if available
	const [formData, setFormData] = useState<Partial<QuoteBookingFormData>>({
		customerName: userInfo?.name || "",
		customerEmail: userInfo?.email || "",
		passengerCount: 1,
	});
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [step, setStep] = useState<"details" | "booking" | "confirmation">("details");
	const [selectedCarId, setSelectedCarId] = useState<string>("");

	// Extract quote data from URL search params
	const quoteData = {
		origin: search?.origin || "",
		destination: search?.destination || "",
		distance: parseFloat(search?.distance || "0"),
		duration: parseInt(search?.duration || "0"),
		totalFare: parseFloat(search?.totalFare || "0"),
	};

	// Update form data when user info is available
	useEffect(() => {
		if (userInfo && !formData.customerName) {
			setFormData(prev => ({
				...prev,
				customerName: userInfo.name || "",
				customerEmail: userInfo.email || "",
			}));
		}
	}, [userInfo, formData.customerName]);

	console.log("🔍 QUOTE BOOKING DEBUG:");
	console.log("Search params:", search);
	console.log("Quote data:", quoteData);
	console.log("User info:", userInfo);
	console.log("Cars data:", carsData);
	console.log("Selected car ID:", selectedCarId);

	const updateFormData = (field: keyof QuoteBookingFormData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (formErrors[field]) {
			setFormErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		try {
			console.log("🔍 Validating quote booking form data:", formData);
			QuoteBookingFormSchema.parse(formData);
			console.log("✅ Quote booking form validation passed");
			setFormErrors({});
			return true;
		} catch (error) {
			console.log("❌ Quote booking form validation failed:", error);
			if (error instanceof z.ZodError) {
				const errors: Record<string, string> = {};
				error.issues.forEach((err) => {
					if (err.path.length > 0) {
						errors[err.path[0] as string] = err.message;
					}
				});
				setFormErrors(errors);
				console.log("Quote booking form errors:", errors);
			}
			return false;
		}
	};

	const handleSubmit = async () => {
		console.log("🚀 Starting quote-based booking submission...");
		
		if (!validateForm()) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (!selectedCarId) {
			toast.error("Please select a vehicle");
			return;
		}

		if (!userInfo) {
			toast.error("Session not available. Please refresh and try again.");
			return;
		}

		if (!quoteData.origin || !quoteData.destination) {
			toast.error("Quote information is missing. Please start a new quote.");
			return;
		}

		try {
			const scheduledPickupTime = new Date(`${formData.scheduledPickupDate}T${formData.scheduledPickupTime}`);
			
			// Calculate pricing based on quote data
			const baseFare = Math.round(quoteData.totalFare * 0.3 * 100); // 30% base
			const distanceFare = Math.round(quoteData.totalFare * 0.6 * 100); // 60% distance
			const timeFare = Math.round(quoteData.totalFare * 0.1 * 100); // 10% time
			const quotedAmount = Math.round(quoteData.totalFare * 100); // Convert to cents
			
			const bookingPayload = {
				userId: userInfo.id,
				originAddress: quoteData.origin,
				destinationAddress: quoteData.destination,
				scheduledPickupTime,
				estimatedDuration: quoteData.duration * 60, // Convert minutes to seconds
				estimatedDistance: quoteData.distance * 1000, // Convert km to meters
				baseFare,
				distanceFare,
				timeFare,
				extraCharges: 0,
				quotedAmount,
				customerName: formData.customerName!,
				customerPhone: formData.customerPhone!,
				customerEmail: formData.customerEmail!,
				passengerCount: formData.passengerCount!,
				specialRequests: formData.specialRequests,
				preferredCategoryId: carsData?.data?.find(car => car.id === selectedCarId)?.category?.id,
			};

			console.log("📦 Quote booking payload:", bookingPayload);

			// Use the mutation hook to create booking
			const result = await createBookingMutation.mutateAsync(bookingPayload);
			
			console.log("✅ Quote booking successful:", result);
			setStep("confirmation");
		} catch (error) {
			console.error("❌ Quote booking failed:", error);
		}
	};

	// Show loading state while session is being established
	if (sessionLoading) {
		return (
			<div className="flex justify-center items-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-gray-600">Setting up session...</span>
			</div>
		);
	}

	// Check if we have valid quote data
	if (!quoteData.origin || !quoteData.destination || !quoteData.totalFare) {
		return (
			<div className="text-center py-12">
				<Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
				<h3 className="text-lg font-medium text-gray-900 mb-2">No quote information found</h3>
				<p className="text-gray-600 mb-4">Please start a new instant quote to proceed with booking</p>
				<Button asChild>
					<Link to="/">Get New Quote</Link>
				</Button>
			</div>
		);
	}

	if (step === "confirmation") {
		return (
			<div className="max-w-2xl mx-auto space-y-6">
				{/* Header */}
				<div className="text-center space-y-4">
					<CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
						<p className="text-gray-600">Your custom booking has been submitted successfully</p>
						{userInfo?.isGuest && (
							<p className="text-sm text-blue-600 mt-2">
								💡 Tip: Create an account to easily manage your bookings
							</p>
						)}
					</div>
				</div>

				{/* Booking Details */}
				<Card>
					<CardHeader>
						<CardTitle>Booking Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h4 className="font-medium">Custom Journey</h4>
							<p className="text-sm text-gray-600">Based on your instant quote</p>
						</div>
						<Separator />
						
						{/* Enhanced Route Display for Confirmation */}
						<div className="p-3 bg-gradient-to-r from-green-50 to-red-50 rounded-lg border border-gray-200">
							{/* Mobile - Vertical Stack */}
							<div className="sm:hidden space-y-3">
								{/* Origin */}
								<div className="flex items-start gap-3">
									<div className="relative mt-0.5">
										<div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm flex-shrink-0" />
										<div className="absolute left-1/2 top-3 w-px h-4 bg-gradient-to-b from-green-500 to-red-500 transform -translate-x-1/2"></div>
									</div>
									<div className="min-w-0 flex-1">
										<div className="text-xs text-gray-500">From</div>
										<div className="font-medium text-sm leading-tight break-words">{quoteData.origin}</div>
									</div>
								</div>
								
								{/* Destination */}
								<div className="flex items-start gap-3">
									<div className="relative mt-0.5">
										<div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm flex-shrink-0" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="text-xs text-gray-500">To</div>
										<div className="font-medium text-sm leading-tight break-words">{quoteData.destination}</div>
									</div>
								</div>
							</div>
							
							{/* Desktop - Horizontal Layout */}
							<div className="hidden sm:flex items-center justify-between gap-4">
								{/* Origin */}
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm flex-shrink-0" />
									<div className="min-w-0 flex-1">
										<div className="text-xs text-gray-500">From</div>
										<div className="font-medium text-sm truncate">{quoteData.origin}</div>
									</div>
								</div>
								
								{/* Route Connector */}
								<div className="flex items-center gap-1 flex-shrink-0">
									<div className="w-4 h-px bg-gradient-to-r from-green-500 to-red-500"></div>
									<div className="w-1.5 h-1.5 border-t border-r border-red-500 transform rotate-45"></div>
								</div>
								
								{/* Destination */}
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm flex-shrink-0" />
									<div className="min-w-0 flex-1">
										<div className="text-xs text-gray-500">To</div>
										<div className="font-medium text-sm truncate">{quoteData.destination}</div>
									</div>
								</div>
							</div>
						</div>
						
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-gray-600">Date & Time:</span>
								<p className="font-medium">{formData.scheduledPickupDate} at {formData.scheduledPickupTime}</p>
							</div>
							<div>
								<span className="text-gray-600">Passengers:</span>
								<p className="font-medium">{formData.passengerCount} passenger{formData.passengerCount !== 1 ? 's' : ''}</p>
							</div>
							<div>
								<span className="text-gray-600">Distance:</span>
								<p className="font-medium">{quoteData.distance.toFixed(1)} km</p>
							</div>
							<div>
								<span className="text-gray-600">Estimated Fare:</span>
								<p className="font-medium text-primary">${quoteData.totalFare.toFixed(2)}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Next Steps */}
				<Card>
					<CardContent className="p-6 text-center">
						<h3 className="font-medium mb-2">What happens next?</h3>
						<p className="text-sm text-gray-600 mb-4">
							Our team will review your booking and contact you within 24 hours to confirm details and assign a driver.
						</p>
						<div className="space-y-2">
							{!userInfo?.isGuest ? (
								<>
									<Button className="w-full" asChild>
										<Link to="/customer/bookings">View My Bookings</Link>
									</Button>
									<Button variant="outline" className="w-full" asChild>
										<Link to="/">Get Another Quote</Link>
									</Button>
								</>
							) : (
								<>
									<Button className="w-full" asChild>
										<Link to="/sign-up">Create Account to Track Bookings</Link>
									</Button>
									<Button variant="outline" className="w-full" asChild>
										<Link to="/">Get Another Quote</Link>
									</Button>
								</>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link to="/">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
					<p className="text-gray-600">
						Based on your instant quote
						{userInfo?.isGuest && <span className="text-blue-600"> (Booking as guest)</span>}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Quote Details Sidebar */}
				<div className="lg:col-span-1">
					<Card className="sticky top-6">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calculator className="h-5 w-5" />
								Your Quote
							</CardTitle>
							<CardDescription>Instant quote details</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Enhanced Route Details */}
							<div className="relative p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
								<div className="space-y-3">
									{/* Origin */}
									<div className="flex items-center gap-3 text-sm">
										<div className="relative">
											<div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm flex-shrink-0" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-gray-900">From</div>
											<div className="text-gray-600 truncate">{quoteData.origin}</div>
										</div>
									</div>

									{/* Route Connection Line */}
									<div className="ml-2 flex items-center gap-2">
										<div className="w-px h-4 bg-gradient-to-b from-green-500 to-red-500" />
										<div className="flex-1 h-px bg-gradient-to-r from-green-500/30 to-red-500/30" />
										<div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
									</div>

									{/* Destination */}
									<div className="flex items-center gap-3 text-sm">
										<div className="relative">
											<div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm flex-shrink-0" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-gray-900">To</div>
											<div className="text-gray-600 truncate">{quoteData.destination}</div>
										</div>
									</div>
								</div>
								
								{/* Route Status Indicator */}
								<div className="absolute top-1 right-1">
									<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
								</div>
							</div>

							<Separator />

							{/* Journey Stats */}
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Distance:</span>
									<span className="font-medium">{quoteData.distance.toFixed(1)} km</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Duration:</span>
									<span className="font-medium">{quoteData.duration} min</span>
								</div>
							</div>

							<Separator />

							{/* Estimated Fare */}
							<div className="text-center p-3 bg-primary/10 rounded-lg">
								<div className="text-sm text-gray-600 mb-1">Estimated Fare</div>
								<div className="text-2xl font-bold text-primary">${quoteData.totalFare.toFixed(2)}</div>
								<div className="text-xs text-gray-500">*Price based on instant quote</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Booking Form */}
				<div className="lg:col-span-2 space-y-6">
					{/* Vehicle Selection */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Car className="h-5 w-5" />
								Select Vehicle
							</CardTitle>
						</CardHeader>
						<CardContent>
							{carsLoading ? (
								<div className="text-center py-8">
									<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
									<p className="text-gray-600">Loading available vehicles...</p>
								</div>
							) : carsError || !carsData?.data?.length ? (
								<div className="text-center py-8">
									<AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
									<p className="text-gray-600">No vehicles currently available</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{carsData.data.map((car) => (
										<div 
											key={car.id}
											className={`p-4 border rounded-lg cursor-pointer transition-colors ${
												selectedCarId === car.id 
													? "border-primary bg-primary/5" 
													: "border-gray-200 hover:border-gray-300"
											}`}
											onClick={() => setSelectedCarId(car.id)}
										>
											{car.images && car.images.length > 0 && (
												<img 
													src={typeof car.images[0] === 'string' ? car.images[0] : car.images[0].url} 
													alt={`${car.model?.brand?.name || ''} ${car.model?.name || ''}`}
													className="w-full h-32 object-cover rounded-lg mb-3"
												/>
											)}
											<h4 className="font-medium">
												{car.model?.brand?.name || 'Unknown'} {car.model?.name || 'Model'}
											</h4>
											<p className="text-sm text-gray-600">{car.category?.name || 'Standard'}</p>
											<div className="flex items-center gap-2 mt-2">
												<Users className="h-4 w-4 text-gray-400" />
												<span className="text-sm">{car.seatingCapacity} seats</span>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Date & Time */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								Date & Time
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="scheduledPickupDate">Pickup Date</Label>
									<Input
										id="scheduledPickupDate"
										type="date"
										value={formData.scheduledPickupDate || ""}
										onChange={(e) => updateFormData("scheduledPickupDate", e.target.value)}
										min={new Date().toISOString().split('T')[0]}
										className={formErrors.scheduledPickupDate ? "border-red-500" : ""}
									/>
									{formErrors.scheduledPickupDate && (
										<p className="text-red-500 text-sm mt-1">{formErrors.scheduledPickupDate}</p>
									)}
								</div>
								<div>
									<Label htmlFor="scheduledPickupTime">Pickup Time</Label>
									<Input
										id="scheduledPickupTime"
										type="time"
										value={formData.scheduledPickupTime || ""}
										onChange={(e) => updateFormData("scheduledPickupTime", e.target.value)}
										className={formErrors.scheduledPickupTime ? "border-red-500" : ""}
									/>
									{formErrors.scheduledPickupTime && (
										<p className="text-red-500 text-sm mt-1">{formErrors.scheduledPickupTime}</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Passenger Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5" />
								Passenger Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="customerName">Full Name</Label>
									<Input
										id="customerName"
										placeholder="Enter your full name"
										value={formData.customerName || ""}
										onChange={(e) => updateFormData("customerName", e.target.value)}
										className={formErrors.customerName ? "border-red-500" : ""}
									/>
									{formErrors.customerName && (
										<p className="text-red-500 text-sm mt-1">{formErrors.customerName}</p>
									)}
								</div>
								<div>
									<Label htmlFor="passengerCount">Number of Passengers</Label>
									<Input
										id="passengerCount"
										type="number"
										min="1"
										max="8"
										value={formData.passengerCount || 1}
										onChange={(e) => updateFormData("passengerCount", parseInt(e.target.value) || 1)}
										className={formErrors.passengerCount ? "border-red-500" : ""}
									/>
									{formErrors.passengerCount && (
										<p className="text-red-500 text-sm mt-1">{formErrors.passengerCount}</p>
									)}
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="customerPhone">Phone Number</Label>
									<Input
										id="customerPhone"
										type="tel"
										placeholder="Enter your phone number"
										value={formData.customerPhone || ""}
										onChange={(e) => updateFormData("customerPhone", e.target.value)}
										className={formErrors.customerPhone ? "border-red-500" : ""}
									/>
									{formErrors.customerPhone && (
										<p className="text-red-500 text-sm mt-1">{formErrors.customerPhone}</p>
									)}
								</div>
								<div>
									<Label htmlFor="customerEmail">Email Address</Label>
									<Input
										id="customerEmail"
										type="email"
										placeholder="Enter your email"
										value={formData.customerEmail || ""}
										onChange={(e) => updateFormData("customerEmail", e.target.value)}
										className={formErrors.customerEmail ? "border-red-500" : ""}
									/>
									{formErrors.customerEmail && (
										<p className="text-red-500 text-sm mt-1">{formErrors.customerEmail}</p>
									)}
								</div>
							</div>
							<div>
								<Label htmlFor="specialRequests">Special Requests (Optional)</Label>
								<Textarea
									id="specialRequests"
									placeholder="Any special requirements or requests..."
									value={formData.specialRequests || ""}
									onChange={(e) => updateFormData("specialRequests", e.target.value)}
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Confirm Booking Button */}
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div>
									<div className="text-lg font-medium">Estimated Cost</div>
									<div className="text-sm text-gray-600">Based on your instant quote</div>
								</div>
								<div className="text-3xl font-bold text-primary">${quoteData.totalFare.toFixed(2)}</div>
							</div>
							<Button 
								className="w-full" 
								onClick={handleSubmit}
								disabled={createBookingMutation.isPending || !selectedCarId}
							>
								{createBookingMutation.isPending ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Confirming Booking...
									</>
								) : (
									<>
										<Package className="h-4 w-4" />
										Confirm Booking
									</>
								)}
							</Button>
							
							{/* Help Messages */}
							{(!selectedCarId || createBookingMutation.isPending) && (
								<div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
									{!selectedCarId && <div>⚠️ Please select a vehicle to continue</div>}
									{createBookingMutation.isPending && <div>📤 Processing your booking...</div>}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}