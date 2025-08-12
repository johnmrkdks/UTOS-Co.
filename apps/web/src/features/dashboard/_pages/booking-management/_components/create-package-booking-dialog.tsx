import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	Form,
	FormControl,
	FormDescription,
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
import { useCreatePackageBookingMutation } from "../_hooks/query/use-create-package-booking-mutation";
import { useGetPackagesQuery } from "../_hooks/query/use-get-packages-query";
import { useGetCarsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car/use-get-cars-query";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";

const createPackageBookingSchema = z.object({
	packageId: z.string().min(1, "Please select a package"),
	carId: z.string().min(1, "Please select a car"),
	userId: z.string().min(1, "Please select a user").default("user-1"), // Default for demo
	originAddress: z.string().min(1, "Origin address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
	scheduledPickupTime: z.date({
		required_error: "Pickup time is required",
	}),
	customerName: z.string().min(1, "Customer name is required"),
	customerPhone: z.string().min(1, "Customer phone is required"),
	customerEmail: z.string().email().optional().or(z.literal("")),
	passengerCount: z.number().int().min(1).max(8).default(1),
	specialRequests: z.string().optional(),
});

type CreatePackageBookingForm = z.infer<typeof createPackageBookingSchema>;

export function CreatePackageBookingDialog() {
	const {
		isCreatePackageBookingDialogOpen,
		closeCreatePackageBookingDialog
	} = useBookingManagementModalProvider();

	const form = useForm<CreatePackageBookingForm>({
		resolver: zodResolver(createPackageBookingSchema),
		defaultValues: {
			passengerCount: 1,
			customerEmail: "",
			specialRequests: "",
		},
	});

	// Fetch data for dropdowns
	const packagesQuery = useGetPackagesQuery({
		limit: 100,
	});

	const carsQuery = useGetCarsQuery({
		limit: 100,
	});

	const createPackageBookingMutation = useCreatePackageBookingMutation(() => {
		closeCreatePackageBookingDialog();
		form.reset();
	});

	const onSubmit = (data: CreatePackageBookingForm) => {
		createPackageBookingMutation.mutate(data);
	};

	const handleClose = () => {
		if (!createPackageBookingMutation.isPending) {
			closeCreatePackageBookingDialog();
			form.reset();
		}
	};

	return (
		<Dialog open={isCreatePackageBookingDialogOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Package Booking</DialogTitle>
					<DialogDescription>
						Create a new booking using a predefined package with fixed pricing.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="packageId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Package</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a package" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{packagesQuery.data?.data?.map((pkg: any) => (
													<SelectItem key={pkg.id} value={pkg.id}>
														{pkg.name} - ${(pkg.fixedPrice / 100).toFixed(2)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

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
												{carsQuery.data?.data?.map((car: any) => (
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
						</div>

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

						<div className="grid grid-cols-2 gap-4">
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
								disabled={createPackageBookingMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={createPackageBookingMutation.isPending}
							>
								{createPackageBookingMutation.isPending ? "Creating..." : "Create Booking"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
