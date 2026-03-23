// @ts-nocheck
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calculator } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { type CreateCustomBookingForm, createCustomBookingSchema, type QuoteResult } from "../../_types/booking"
import { DateInput } from "@workspace/ui/components/date-input"

interface BookingFormProps {
	cars?: Array<{ id: string; name: string }>
	carsLoading: boolean
	onSubmit: (data: CreateCustomBookingForm) => void
	onCalculateQuote: () => void
	isSubmitting: boolean
	isCalculatingQuote: boolean
	quote: QuoteResult | null
}

export function BookingForm({
	cars,
	carsLoading,
	onSubmit,
	onCalculateQuote,
	isSubmitting,
	isCalculatingQuote,
	quote,
}: BookingFormProps) {
	const form = useForm<CreateCustomBookingForm>({
		resolver: zodResolver(createCustomBookingSchema),
		defaultValues: {
			passengerCount: 1,
			customerEmail: "",
			specialRequests: "",
		},
	})

	const watchedValues = form.watch(["carId", "scheduledPickupTime"])
	const canCalculateQuote = watchedValues[0] && watchedValues[1]

	return (
		<Form {...form as any}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* Vehicle Selection */}
				<FormField
					control={form.control as any}
					name="carId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Vehicle *</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value} disabled={carsLoading}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={carsLoading ? "Loading vehicles..." : "Select a vehicle"} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{cars?.map((car) => (
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

				{/* Customer Information */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Customer Information</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control as any}
							name="customerName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name *</FormLabel>
									<FormControl>
										<Input placeholder="John Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control as any}
							name="customerPhone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone *</FormLabel>
									<FormControl>
										<Input placeholder="+1 (555) 123-4567" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={form.control as any}
						name="customerEmail"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email (Optional)</FormLabel>
								<FormControl>
									<Input placeholder="john@example.com" type="email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Trip Details */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Trip Details</h3>
					<div className="space-y-4">
						<FormField
							control={form.control as any}
							name="originAddress"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Origin *</FormLabel>
									<FormControl>
										<Input placeholder="123 Main St, City" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control as any}
							name="destinationAddress"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Destination *</FormLabel>
									<FormControl>
										<Input placeholder="456 Oak St, City" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control as any}
							name="scheduledPickupTime"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Pickup Date & Time *</FormLabel>
									<FormControl>
										<DateInput value={field.value} onDateChange={field.onChange} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control as any}
							name="passengerCount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Passengers *</FormLabel>
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
				</div>

				{/* Quote Calculation */}
				<div className="space-y-4">
					<Button
						type="button"
						variant="outline"
						className="w-full bg-transparent"
						onClick={onCalculateQuote}
						disabled={!canCalculateQuote || isCalculatingQuote}
					>
						<Calculator className="mr-2 h-4 w-4" />
						{isCalculatingQuote ? "Calculating..." : "Calculate Instant Quote"}
					</Button>
					{!canCalculateQuote && (
						<p className="text-sm text-muted-foreground text-center">
							Select a vehicle and pickup time to calculate quote
						</p>
					)}
				</div>

				{/* Special Requests */}
				<FormField
					control={form.control as any}
					name="specialRequests"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Special Requests (Optional)</FormLabel>
							<FormControl>
								<Textarea placeholder="Any special requests or notes..." className="min-h-[80px]" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Submit Button */}
				<Button type="submit" className="w-full" disabled={isSubmitting || !quote} size="lg">
					{isSubmitting ? "Creating Booking..." : "Create Booking"}
				</Button>

				{!quote && (
					<p className="text-sm text-muted-foreground text-center">
						Please calculate a quote before creating the booking
					</p>
				)}
			</form>
		</Form>
	)
}

