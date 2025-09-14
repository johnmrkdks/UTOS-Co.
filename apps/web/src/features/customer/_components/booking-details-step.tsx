import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Calendar, Users, ArrowLeft, User, Phone, Mail, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { bookingDetailsSchema, type BookingDetailsFormData } from "../_schemas/instant-quote";
import { ImprovedDateTimePicker } from "@/components/improved-datetime-picker";

interface BookingDetailsStepProps {
	selectedCarId: string;
	onSubmit: (data: BookingDetailsFormData) => void;
	onBack: () => void;
	isSubmitting?: boolean;
}

export function BookingDetailsStep({ 
	selectedCarId, 
	onSubmit, 
	onBack, 
	isSubmitting = false 
}: BookingDetailsStepProps) {
	const { session } = useUserQuery();
	
	const form = useForm<BookingDetailsFormData>({
		resolver: zodResolver(bookingDetailsSchema) as any,
		defaultValues: {
			customerName: session?.user?.name || "",
			customerPhone: "",
			customerEmail: session?.user?.email || "",
			passengerCount: 1,
			luggageCount: 0,
			scheduledPickupTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
			specialRequests: "",
			selectedCarId: selectedCarId,
		}
	});

	const handleSubmit = (data: BookingDetailsFormData) => {
		onSubmit(data);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					Booking Details
				</CardTitle>
				<CardDescription>
					Complete your booking information
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form as any}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						{/* Customer Name */}
						<FormField
							control={form.control as any}
							name="customerName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name *</FormLabel>
									<FormControl>
										<div className="relative">
											<User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input {...field} placeholder="Enter your full name" className="pl-10" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Customer Phone */}
						<FormField
							control={form.control as any}
							name="customerPhone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone Number *</FormLabel>
									<FormControl>
										<div className="relative">
											<Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input {...field} placeholder="Enter your phone number" className="pl-10" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Customer Email */}
						<FormField
							control={form.control as any}
							name="customerEmail"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email (Optional)</FormLabel>
									<FormControl>
										<div className="relative">
											<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input {...field} placeholder="Enter your email" className="pl-10" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Passenger and Luggage Count side by side */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<FormField
								control={form.control as any}
								name="passengerCount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Number of Passengers *</FormLabel>
										<FormControl>
											<div className="relative">
												<Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
												<Input
													{...field}
													type="number"
													min="1"
													max="8"
													placeholder="Number of passengers"
													className="pl-10"
													onChange={(e) => field.onChange(Number(e.target.value))}
												/>
											</div>
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
												{...field}
												type="number"
												min="0"
												max="10"
												placeholder="Number of luggage pieces"
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Pickup Date/Time */}
						<FormField
							control={form.control as any}
							name="scheduledPickupTime"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Pickup Date & Time *</FormLabel>
									<FormControl>
										<ImprovedDateTimePicker
											value={field.value}
											onChange={field.onChange}
											placeholder="Select pickup date and time"
											minDate={new Date()}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Special Requests */}
						<FormField
							control={form.control as any}
							name="specialRequests"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Special Requests (Optional)</FormLabel>
									<FormControl>
										<div className="relative">
											<MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Textarea
												{...field}
												placeholder="Any special requirements or requests..."
												className="pl-10 min-h-[80px]"
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Navigation Buttons */}
						<div className="flex justify-between pt-4">
							<Button type="button" variant="outline" onClick={onBack}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Processing..." : "Continue to Confirmation"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}