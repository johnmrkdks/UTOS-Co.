import React, { useState, useCallback, useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Calculator, Plus, X, MapPin, Navigation, Users, Package2, Clock, Car } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { DateTimePicker } from "@/components/date-time-picker"
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple"
import { createLocalDateForBackend } from "@/utils/timezone"
import type { QuoteResult } from "../../_types/booking"
import { useGetUsersQuery } from "../../../drivers/_hooks/query/use-get-users-query"

// Enhanced schema with stops and luggage support
const createEnhancedCustomBookingSchema = z.object({
	carId: z.string().min(1, "Please select a car"),
	userId: z.string().min(1, "Please select a user").default("user-1"),
	originAddress: z.string().min(1, "Origin address is required"),
	originLatitude: z.number().optional(),
	originLongitude: z.number().optional(),
	destinationAddress: z.string().min(1, "Destination address is required"),
	destinationLatitude: z.number().optional(),
	destinationLongitude: z.number().optional(),
	stops: z.array(z.object({
		address: z.string().min(1, "Stop address is required"),
		latitude: z.number().optional(),
		longitude: z.number().optional(),
		waitingTime: z.number().min(0).default(5),
		notes: z.string().optional(),
	})).optional().default([]),
	scheduledPickupDate: z.string().min(1, "Please select a pickup date"),
	scheduledPickupTime: z.string().min(1, "Please select a pickup time"),
	customerName: z.string().min(1, "Customer name is required"),
	customerPhone: z.string().min(1, "Customer phone is required"),
	customerEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
	passengerCount: z.number().int().min(1).max(8).default(1),
	luggageCount: z.number().int().min(0).max(10).default(0),
	specialRequests: z.string().optional(),
})

export type EnhancedCustomBookingForm = z.infer<typeof createEnhancedCustomBookingSchema>

interface EnhancedBookingFormProps {
	cars?: Array<{
		id: string
		name: string
		brand?: { name: string }
		model?: { name: string }
		category?: { name: string }
		maxPassengers?: number
		maxLuggage?: number
		features?: Array<{ name: string }>
	}>
	carsLoading: boolean
	onSubmit: (data: EnhancedCustomBookingForm) => void
	onCalculateQuote: (formData: EnhancedCustomBookingForm) => void
	onFormChange?: (formData: Partial<EnhancedCustomBookingForm>) => void
	isSubmitting: boolean
	isCalculatingQuote: boolean
	quote: QuoteResult | null
}

export function EnhancedCustomBookingForm({
	cars,
	carsLoading,
	onSubmit,
	onCalculateQuote,
	onFormChange,
	isSubmitting,
	isCalculatingQuote,
	quote,
}: EnhancedBookingFormProps) {
	const [originGeometry, setOriginGeometry] = useState<any>(null)
	const [destinationGeometry, setDestinationGeometry] = useState<any>(null)
	const [stopsGeometry, setStopsGeometry] = useState<any[]>([])
	const [selectedCar, setSelectedCar] = useState<any>(null)

	// Fetch users for selection
	const { data: users, isLoading: usersLoading } = useGetUsersQuery({
		role: "user", // Only fetch customers
		limit: 100
	})

	const form = useForm<EnhancedCustomBookingForm>({
		resolver: zodResolver(createEnhancedCustomBookingSchema),
		mode: "onChange", // Optimize validation
		defaultValues: {
			userId: users?.data?.[0]?.id || "",
			passengerCount: 1,
			luggageCount: 0,
			customerEmail: "",
			specialRequests: "",
			stops: [],
			scheduledPickupDate: "",
			scheduledPickupTime: "",
		},
	})

	const { fields: stopFields, append: appendStop, remove: removeStop } = useFieldArray({
		control: form.control,
		name: "stops",
	})

	// Watch for car selection changes
	const watchedCarId = form.watch("carId")

	useEffect(() => {
		if (watchedCarId && cars) {
			const car = cars.find(c => c.id === watchedCarId)
			setSelectedCar(car)
		}
	}, [watchedCarId, cars])

	// Watch form values more efficiently
	const watchedValues = form.watch([
		"carId", "userId", "originAddress", "destinationAddress",
		"scheduledPickupDate", "scheduledPickupTime", "passengerCount",
		"customerName", "customerPhone", "customerEmail",
		"luggageCount", "specialRequests", "stops"
	])

	const [
		carId, userId, originAddress, destinationAddress,
		scheduledPickupDate, scheduledPickupTime, passengerCount,
		customerName, customerPhone, customerEmail,
		luggageCount, specialRequests, stops
	] = watchedValues

	// Memoize the combined form data to prevent unnecessary updates
	const formDataWithGeometry = useMemo(() => ({
		carId,
		userId,
		originAddress,
		destinationAddress,
		scheduledPickupDate,
		scheduledPickupTime,
		passengerCount,
		customerName,
		customerPhone,
		customerEmail,
		luggageCount,
		specialRequests,
		stops,
		originLatitude: originGeometry?.location?.lat(),
		originLongitude: originGeometry?.location?.lng(),
		destinationLatitude: destinationGeometry?.location?.lat(),
		destinationLongitude: destinationGeometry?.location?.lng(),
	}), [carId, userId, originAddress, destinationAddress, scheduledPickupDate, scheduledPickupTime, passengerCount, customerName, customerPhone, customerEmail, luggageCount, specialRequests, stops, originGeometry, destinationGeometry])

	// Debounced form change notification to reduce excessive updates
	useEffect(() => {
		if (onFormChange) {
			const timeoutId = setTimeout(() => {
				onFormChange(formDataWithGeometry)
			}, 300) // Debounce form changes by 300ms

			return () => clearTimeout(timeoutId)
		}
	}, [formDataWithGeometry])

	// Handle place selection for origin
	const handleOriginPlaceSelect = useCallback((place: { placeId: string; description: string; geometry?: any }) => {
		if (place.geometry?.location) {
			const lat = place.geometry.location.lat();
			const lng = place.geometry.location.lng();
			setOriginGeometry(place.geometry)
			// Set both the address and coordinates
			form.setValue("originAddress", place.description)
			form.setValue("originLatitude", lat)
			form.setValue("originLongitude", lng)
		}
	}, [form])

	// Handle place selection for destination
	const handleDestinationPlaceSelect = useCallback((place: { placeId: string; description: string; geometry?: any }) => {
		if (place.geometry?.location) {
			const lat = place.geometry.location.lat();
			const lng = place.geometry.location.lng();
			setDestinationGeometry(place.geometry)
			// Set both the address and coordinates
			form.setValue("destinationAddress", place.description)
			form.setValue("destinationLatitude", lat)
			form.setValue("destinationLongitude", lng)
		}
	}, [form])

	// Handle place selection for stops
	const handleStopPlaceSelect = useCallback((index: number, place: { placeId: string; description: string; geometry?: any }) => {
		if (place.geometry?.location) {
			const newStopsGeometry = [...stopsGeometry]
			newStopsGeometry[index] = place.geometry
			setStopsGeometry(newStopsGeometry)

			// Set both the address and coordinates for stops
			form.setValue(`stops.${index}.address`, place.description)
			form.setValue(`stops.${index}.latitude`, place.geometry.location.lat())
			form.setValue(`stops.${index}.longitude`, place.geometry.location.lng())
		}
	}, [form, stopsGeometry])

	// Add a new stop
	const handleAddStop = () => {
		appendStop({
			address: "",
			waitingTime: 5,
			notes: "",
		})
	}

	// Remove a stop
	const handleRemoveStop = (index: number) => {
		removeStop(index)
		const newStopsGeometry = [...stopsGeometry]
		newStopsGeometry.splice(index, 1)
		setStopsGeometry(newStopsGeometry)
	}

	// Check if quote can be calculated
	const canCalculateQuote = Boolean(
		carId &&
		originAddress &&
		destinationAddress &&
		scheduledPickupDate &&
		scheduledPickupTime &&
		passengerCount
	)

	// Handle quote calculation
	const handleCalculateQuote = () => {
		if (canCalculateQuote) {
			onCalculateQuote(formDataWithGeometry as any)
		}
	}

	// Handle form submission
	const handleSubmit = (data: EnhancedCustomBookingForm) => {
		if (!quote) {
			// toast.error("Please calculate a quote first")
			return
		}
		onSubmit(data)
	}

	return (
		<Form {...form as any}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" data-enhanced-booking-form>
				{/* Car Selection */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Car className="h-5 w-5" />
							Vehicle Selection
						</CardTitle>
						<CardDescription>Choose the vehicle for this booking</CardDescription>
					</CardHeader>
					<CardContent>
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
													<div className="flex items-center justify-between w-full">
														<span>{car.name}</span>
														{car.brand && car.model && (
															<Badge variant="outline" className="ml-2">
																{car.brand.name} {car.model.name}
															</Badge>
														)}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />

									{/* Selected Car Details */}
									{selectedCar && (
										<div className="mt-3 p-3 bg-muted/30 rounded-lg">
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<span className="text-sm font-medium">Selected Vehicle:</span>
													<span className="text-sm">{selectedCar.name}</span>
												</div>
												{selectedCar.category && (
													<div className="flex items-center justify-between">
														<span className="text-sm text-muted-foreground">Category:</span>
														<Badge variant="outline">{selectedCar.category.name}</Badge>
													</div>
												)}
												<div className="flex items-center justify-between">
													<span className="text-sm text-muted-foreground">Capacity:</span>
													<span className="text-sm">
														{selectedCar.maxPassengers || 4} passengers, {selectedCar.maxLuggage || 2} luggage
													</span>
												</div>
												{selectedCar.features && selectedCar.features.length > 0 && (
													<div className="space-y-1">
														<span className="text-sm text-muted-foreground">Features:</span>
														<div className="flex flex-wrap gap-1">
															{selectedCar.features.slice(0, 3).map((feature: any, index: number) => (
																<Badge key={index} variant="secondary" className="text-xs">
																	{feature.name}
																</Badge>
															))}
															{selectedCar.features.length > 3 && (
																<Badge variant="secondary" className="text-xs">
																	+{selectedCar.features.length - 3} more
																</Badge>
															)}
														</div>
													</div>
												)}
											</div>
										</div>
									)}
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Customer Selection */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Customer Selection
						</CardTitle>
						<CardDescription>
							Select the customer for this booking
						</CardDescription>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control}
							name="userId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Customer *</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value} disabled={usersLoading}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder={usersLoading ? "Loading customers..." : "Select a customer"} />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{users?.data?.map((user) => (
												<SelectItem key={user.id} value={user.id}>
													<div className="flex items-center justify-between w-full">
														<span>{user.name || user.email}</span>
														<Badge variant="outline" className="ml-2">
															{user.email}
														</Badge>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Customer Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Customer Information
						</CardTitle>
						<CardDescription>Enter the customer's contact details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control as any}
								name="customerName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Customer Name *</FormLabel>
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
										<FormLabel>Phone Number *</FormLabel>
										<FormControl>
											<Input placeholder="+61 XXX XXX XXX" {...field} />
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
									<FormLabel>Email Address (Optional)</FormLabel>
									<FormControl>
										<Input placeholder="john@example.com" type="email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Route Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Navigation className="h-5 w-5" />
							Route Information
						</CardTitle>
						<CardDescription>Enter pickup, destination, and any stops</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Origin */}
						<FormField
							control={form.control as any}
							name="originAddress"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center gap-2">
										Pickup Location *
										{originGeometry?.location && (
											<Badge variant="secondary" className="text-xs">
												📍 Location Selected
											</Badge>
										)}
									</FormLabel>
									<FormControl>
										<GooglePlacesInput
											value={field.value}
											onChange={field.onChange}
											onPlaceSelect={handleOriginPlaceSelect}
											placeholder="Enter pickup location in Australia..."
										/>
									</FormControl>
									<FormMessage />
									{field.value && !originGeometry?.location && (
										<p className="text-xs text-amber-600">
											⚠️ Please select from dropdown suggestions for accurate location
										</p>
									)}
								</FormItem>
							)}
						/>

						{/* Stops */}
						{stopFields.length > 0 && (
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-blue-600" />
									<span className="text-sm font-medium">Stops</span>
								</div>
								{stopFields.map((field, index) => (
									<div key={field.id} className="border rounded-lg p-3 space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">Stop {index + 1}</span>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => handleRemoveStop(index)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
										<FormField
											control={form.control as any}
											name={`stops.${index}.address`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Stop Address *</FormLabel>
													<FormControl>
														<GooglePlacesInput
															value={field.value}
															onChange={field.onChange}
															onPlaceSelect={(place) => handleStopPlaceSelect(index, place)}
															placeholder="Enter stop location..."
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<div className="grid grid-cols-2 gap-3">
											<FormField
												control={form.control as any}
												name={`stops.${index}.waitingTime`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>Waiting Time (minutes)</FormLabel>
														<FormControl>
															<Input
																type="number"
																min="0"
																max="60"
																{...field}
																onChange={(e) => field.onChange(Number(e.target.value))}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control as any}
												name={`stops.${index}.notes`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>Stop Notes</FormLabel>
														<FormControl>
															<Input placeholder="Optional notes..." {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>
								))}
							</div>
						)}

						{/* Add Stop Button */}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleAddStop}
							className="w-full"
						>
							<Plus className="h-4 w-4 mr-2" />
							Add Stop
						</Button>

						{/* Destination */}
						<FormField
							control={form.control as any}
							name="destinationAddress"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center gap-2">
										Destination *
										{destinationGeometry?.location && (
											<Badge variant="secondary" className="text-xs">
												📍 Location Selected
											</Badge>
										)}
									</FormLabel>
									<FormControl>
										<GooglePlacesInput
											value={field.value}
											onChange={field.onChange}
											onPlaceSelect={handleDestinationPlaceSelect}
											placeholder="Enter destination in Australia..."
										/>
									</FormControl>
									<FormMessage />
									{field.value && !destinationGeometry?.location && (
										<p className="text-xs text-amber-600">
											⚠️ Please select from dropdown suggestions for accurate location
										</p>
									)}
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Trip Details */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Clock className="h-5 w-5" />
							Trip Details
						</CardTitle>
						<CardDescription>Set pickup time and passenger information</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Date & Time Picker */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control as any}
								name="scheduledPickupDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pickup Date *</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control as any}
								name="scheduledPickupTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pickup Time *</FormLabel>
										<FormControl>
											<Input type="time" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Passengers & Luggage */}
						<div className="grid grid-cols-2 gap-4">
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
												max={selectedCar?.maxPassengers || 8}
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control as any}
								name="luggageCount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Luggage Pieces</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												max={selectedCar?.maxLuggage || 10}
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
				</Card>


				{/* Special Requests */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Package2 className="h-5 w-5" />
							Additional Information
						</CardTitle>
						<CardDescription>Any special requests or notes</CardDescription>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control as any}
							name="specialRequests"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Special Requests (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Any special requests, accessibility needs, or additional notes..."
											className="min-h-[80px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Hidden Calculate Quote Button for sidebar to trigger */}
				<Button
					type="button"
					onClick={handleCalculateQuote}
					data-form-calculate-quote
					className="hidden"
					aria-hidden="true"
				>
					Hidden Calculate Quote
				</Button>

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