import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateCustomBookingMutation } from "../_hooks/query/use-create-custom-booking-mutation";
import { useCalculateInstantQuoteMutation } from "../_hooks/query/use-calculate-instant-quote-mutation";
import { useGetCarsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car/use-get-cars-query";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarIcon, Calculator, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

const createCustomBookingSchema = z.object({
	carId: z.string().min(1, "Please select a car"),
	userId: z.string().min(1, "Please select a user").default("user-1"), // Default for demo
	originAddress: z.string().min(1, "Origin address is required"),
	originLatitude: z.number().optional(),
	originLongitude: z.number().optional(),
	destinationAddress: z.string().min(1, "Destination address is required"),
	destinationLatitude: z.number().optional(),
	destinationLongitude: z.number().optional(),
	scheduledPickupTime: z.date({
		required_error: "Pickup time is required",
	}),
	customerName: z.string().min(1, "Customer name is required"),
	customerPhone: z.string().min(1, "Customer phone is required"),
	customerEmail: z.string().email().optional().or(z.literal("")),
	passengerCount: z.number().int().min(1).max(8).default(1),
	specialRequests: z.string().optional(),
});

type CreateCustomBookingForm = z.infer<typeof createCustomBookingSchema>;

interface QuoteResult {
	baseFare: number;
	distanceFare: number;
	timeFare: number;
	extraCharges: number;
	totalAmount: number;
	estimatedDistance: number;
	estimatedDuration: number;
	breakdown: {
		baseRate: number;
		perKmRate: number;
		perMinuteRate: number;
		minimumFare: number;
		surgePricing?: number;
	};
}

export function CreateCustomBookingDialog() {
	const { 
		isCreateCustomBookingDialogOpen, 
		closeCreateCustomBookingDialog 
	} = useBookingManagementModalProvider();
	
	const [quote, setQuote] = useState<QuoteResult | null>(null);
	const [isCalculatingQuote, setIsCalculatingQuote] = useState(false);
	
	const form = useForm<CreateCustomBookingForm>({
		resolver: zodResolver(createCustomBookingSchema),
		defaultValues: {
			passengerCount: 1,
			customerEmail: "",
			specialRequests: "",
		},
	});

	// Fetch data for dropdowns
	const carsQuery = useGetCarsQuery({
		page: 1,
		limit: 100,
	});

	const calculateQuoteMutation = useCalculateInstantQuoteMutation();
	const createCustomBookingMutation = useCreateCustomBookingMutation(() => {
		closeCreateCustomBookingDialog();
		form.reset();
		setQuote(null);
	});

	const handleCalculateQuote = () => {
		const { carId, scheduledPickupTime } = form.getValues();
		
		if (!carId || !scheduledPickupTime) {
			toast.error("Please select a car and pickup time to calculate quote");
			return;
		}

		// Mock coordinates for demo - in real app, you'd use geocoding
		const mockOriginLat = -33.8688;
		const mockOriginLng = 151.2093;
		const mockDestLat = -33.8731;
		const mockDestLng = 151.2067;

		setIsCalculatingQuote(true);
		calculateQuoteMutation.mutate(
			{
				originLatitude: mockOriginLat,
				originLongitude: mockOriginLng,
				destinationLatitude: mockDestLat,
				destinationLongitude: mockDestLng,
				carId,
				scheduledPickupTime,
			},
			{
				onSuccess: (data) => {
					setQuote(data);
					setIsCalculatingQuote(false);
				},
				onError: () => {
					setIsCalculatingQuote(false);
				},
			}
		);
	};

	const onSubmit = (data: CreateCustomBookingForm) => {
		if (!quote) {
			toast.error("Please calculate a quote first");
			return;
		}

		createCustomBookingMutation.mutate({
			...data,
			quotedAmount: quote.totalAmount,
			baseFare: quote.baseFare,
			distanceFare: quote.distanceFare,
			timeFare: quote.timeFare,
			estimatedDistance: quote.estimatedDistance,
			estimatedDuration: quote.estimatedDuration,
		});
	};

	const handleClose = () => {
		if (!createCustomBookingMutation.isPending) {
			closeCreateCustomBookingDialog();
			form.reset();
			setQuote(null);
		}
	};

	return (
		<Dialog open={isCreateCustomBookingDialogOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Custom Booking</DialogTitle>
					<DialogDescription>
						Create a custom booking with instant quote calculation based on route and time.
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
								<FormField
									control={form.control}
									name="carId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Vehicle</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a vehicle" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{carsQuery.data?.items?.map((car) => (
														<SelectItem key={car.id} value={car.id}>
															{car.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="customerName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Customer Name</FormLabel>
												<FormControl>
													<Input placeholder="John Doe" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="customerPhone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Customer Phone</FormLabel>
												<FormControl>
													<Input placeholder="+1 (555) 123-4567" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="customerEmail"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Customer Email (Optional)</FormLabel>
											<FormControl>
												<Input placeholder="john@example.com" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 gap-4">
									<FormField
										control={form.control}
										name="originAddress"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Pickup Address</FormLabel>
												<FormControl>
													<Input placeholder="123 Main St, City" {...field} />
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
												<FormLabel>Destination Address</FormLabel>
												<FormControl>
													<Input placeholder="456 Oak St, City" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="scheduledPickupTime"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Pickup Date & Time</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant="outline"
																className={cn(
																	"w-full pl-3 text-left font-normal",
																	!field.value && "text-muted-foreground"
																)}
															>
																{field.value ? (
																	format(field.value, "PPP p")
																) : (
																	<span>Pick a date and time</span>
																)}
																<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<Calendar
															mode="single"
															selected={field.value}
															onSelect={field.onChange}
															disabled={(date) =>
																date < new Date() || date < new Date("1900-01-01")
															}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="passengerCount"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Number of Passengers</FormLabel>
												<FormControl>
													<Input 
														type="number" 
														min="1" 
														max="8" 
														{...field}
														onChange={(e) => field.onChange(Number(e.target.value))}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={handleCalculateQuote}
									disabled={isCalculatingQuote}
								>
									<Calculator className="mr-2 h-4 w-4" />
									{isCalculatingQuote ? "Calculating..." : "Calculate Instant Quote"}
								</Button>

								<FormField
									control={form.control}
									name="specialRequests"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Special Requests (Optional)</FormLabel>
											<FormControl>
												<Textarea 
													placeholder="Any special requests or notes..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={handleClose}
										disabled={createCustomBookingMutation.isPending}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={createCustomBookingMutation.isPending || !quote}
									>
										{createCustomBookingMutation.isPending ? "Creating..." : "Create Booking"}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</div>

					{/* Quote Display */}
					<div className="lg:col-span-1">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calculator className="h-5 w-5" />
									Instant Quote
								</CardTitle>
								<CardDescription>
									Calculate pricing based on route and time
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{quote ? (
									<div className="space-y-3">
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<MapPin className="h-4 w-4" />
											{(quote.estimatedDistance / 1000).toFixed(1)} km • {Math.round(quote.estimatedDuration / 60)} min
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
											<hr />
											<div className="flex justify-between font-semibold">
												<span>Total</span>
												<span>${(quote.totalAmount / 100).toFixed(2)}</span>
											</div>
										</div>

										{quote.breakdown.surgePricing && quote.breakdown.surgePricing > 1 && (
											<Badge variant="warning" className="w-full justify-center">
												{((quote.breakdown.surgePricing - 1) * 100).toFixed(0)}% surge pricing
											</Badge>
										)}

										<div className="text-xs text-muted-foreground space-y-1">
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
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}