import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { CalendarIcon, EditIcon, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React from "react";
import { format } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";
import { Calendar } from "@workspace/ui/components/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@workspace/ui/components/popover";
import { useEditBookingMutation } from "../_hooks/query/use-edit-booking-mutation";
import type { Booking } from "./booking-table-columns";

const editBookingSchema = z.object({
	originAddress: z.string().min(1, "Origin address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
	scheduledPickupTime: z.date(),
	notes: z.string().optional(),
	quotedAmount: z.number().positive("Amount must be positive"),
	customerName: z.string().min(1, "Customer name is required"),
	customerPhone: z.string().min(1, "Customer phone is required"),
	customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
});

type EditBookingFormData = z.infer<typeof editBookingSchema>;

interface EditBookingDialogProps {
	booking: Booking | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditBookingDialog({
	booking,
	open,
	onOpenChange,
}: EditBookingDialogProps) {
	const editBookingMutation = useEditBookingMutation();

	const form = useForm<EditBookingFormData>({
		resolver: zodResolver(editBookingSchema),
		defaultValues: {
			originAddress: booking?.originAddress || "",
			destinationAddress: booking?.destinationAddress || "",
			scheduledPickupTime: booking?.scheduledPickupTime ? new Date(booking.scheduledPickupTime) : new Date(),
			notes: booking?.notes || "",
			quotedAmount: booking?.quotedAmount ? booking.quotedAmount / 100 : 0,
			customerName: booking?.customerName || "",
			customerPhone: booking?.customerPhone || "",
			customerEmail: booking?.customerEmail || "",
		},
	});

	const onSubmit = (data: EditBookingFormData) => {
		if (!booking?.id) return;

		editBookingMutation.mutate({
			id: booking.id,
			...data,
			quotedAmount: Math.round(data.quotedAmount * 100), // Convert to cents
		}, {
			onSuccess: () => {
				onOpenChange(false);
				form.reset();
			}
		});
	};

	// Update form values when booking changes
	React.useEffect(() => {
		if (booking) {
			form.reset({
				originAddress: booking.originAddress || "",
				destinationAddress: booking.destinationAddress || "",
				scheduledPickupTime: booking.scheduledPickupTime ? new Date(booking.scheduledPickupTime) : new Date(),
				notes: booking.notes || "",
				quotedAmount: booking.quotedAmount ? booking.quotedAmount / 100 : 0,
				customerName: booking.customerName || "",
				customerPhone: booking.customerPhone || "",
				customerEmail: booking.customerEmail || "",
			});
		}
	}, [booking, form]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<EditIcon className="h-5 w-5 text-primary" />
						Edit Booking
					</DialogTitle>
					<DialogDescription>
						Update booking details for {booking?.id}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Customer Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Customer Information</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="customerName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Customer Name</FormLabel>
											<FormControl>
												<Input placeholder="Full name" {...field} />
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
											<FormLabel>Phone Number</FormLabel>
											<FormControl>
												<Input placeholder="+61 XXX XXX XXX" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="customerEmail"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email (Optional)</FormLabel>
											<FormControl>
												<Input placeholder="customer@email.com" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Trip Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Trip Information</h3>
							<div className="grid grid-cols-1 gap-4">
								<FormField
									control={form.control}
									name="originAddress"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Origin Address</FormLabel>
											<FormControl>
												<Input placeholder="Pickup location" {...field} />
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
												<Input placeholder="Drop-off location" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
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
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value && "text-muted-foreground"
															)}
														>
															{field.value ? (
																format(field.value, "PPP 'at' p")
															) : (
																<span>Pick a date</span>
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
							</div>
						</div>

						{/* Pricing */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Pricing</h3>
							<FormField
								control={form.control}
								name="quotedAmount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Quoted Amount (AUD)</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												placeholder="0.00"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Notes */}
						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Additional notes or special requests"
											className="min-h-[80px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex gap-3 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={editBookingMutation.isPending}
								className="flex-1 bg-primary hover:bg-primary/90"
							>
								{editBookingMutation.isPending ? (
									<>
										<Loader className="h-4 w-4 mr-2 animate-spin" />
										Updating...
									</>
								) : (
									"Update Booking"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}