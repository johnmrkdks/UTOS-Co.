import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useGetAvailableDriversQuery } from "@/features/dashboard/_pages/drivers/_hooks/query/use-get-available-drivers-query";
import { useAssignDriverMutation } from "../_hooks/query/use-assign-driver-mutation";
import { Loader2, User, Car, Phone, MapPin } from "lucide-react";

const assignDriverSchema = z.object({
	driverId: z.string().min(1, "Please select a driver"),
});

type AssignDriverForm = z.infer<typeof assignDriverSchema>;

type AssignDriverDialogProps = {
	booking: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function AssignDriverDialog({ booking, open, onOpenChange }: AssignDriverDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const assignDriverMutation = useAssignDriverMutation();

	// Debug props
	console.log("🚗 AssignDriverDialog props:", { booking: booking?.id, open, bookingData: booking });

	// Calculate time slot for availability check
	const timeSlot = booking?.scheduledPickupTime ? {
		start: new Date(booking.scheduledPickupTime),
		end: new Date(new Date(booking.scheduledPickupTime).getTime() + (booking.estimatedDuration || 3600) * 1000),
	} : undefined;

	const availableDriversQuery = useGetAvailableDriversQuery({ timeSlot });

	const form = useForm<AssignDriverForm>({
		resolver: zodResolver(assignDriverSchema),
		defaultValues: {
			driverId: "",
		},
	});

	const selectedDriverId = form.watch("driverId");
	const selectedDriver = availableDriversQuery.data?.find((d: any) => d.id === selectedDriverId);

	const onSubmit = async (data: AssignDriverForm) => {
		if (!booking?.id) return;
		
		setIsSubmitting(true);
		try {
			await assignDriverMutation.mutateAsync({
				bookingId: booking.id,
				driverId: data.driverId,
			});
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to assign driver:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Assign Driver to Booking</DialogTitle>
					<DialogDescription>
						Select an available driver for this booking. Only approved and active drivers are shown.
					</DialogDescription>
				</DialogHeader>
				

				<Form {...form as any}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control as any}
							name="driverId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Available Drivers</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a driver" />
											</SelectTrigger>
										</FormControl>
										<SelectContent className="max-h-[300px]">
											{availableDriversQuery.isLoading && (
												<SelectItem value="loading" disabled>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Loading drivers...
												</SelectItem>
											)}
											{availableDriversQuery.data?.map((driver: any) => (
												<SelectItem key={driver.id} value={driver.id}>
													<div className="flex items-center gap-2">
														<User className="h-4 w-4" />
														<span>{driver.user?.name || "Unknown"}</span>
														{driver.car && (
															<Badge variant="outline" className="ml-2">
																{driver.car.name}
															</Badge>
														)}
													</div>
												</SelectItem>
											))}
											{availableDriversQuery.data?.length === 0 && (
												<SelectItem value="no-drivers" disabled>
													No available drivers found
												</SelectItem>
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Selected Driver Details */}
						{selectedDriver && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<User className="h-5 w-5" />
										Driver Details
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm font-medium">Name</p>
											<p className="text-sm text-muted-foreground">{selectedDriver.user?.name}</p>
										</div>
										<div>
											<p className="text-sm font-medium">Email</p>
											<p className="text-sm text-muted-foreground">{selectedDriver.user?.email}</p>
										</div>
										<div>
											<p className="text-sm font-medium">Phone</p>
											<p className="text-sm text-muted-foreground flex items-center gap-1">
												<Phone className="h-3 w-3" />
												{selectedDriver.phoneNumber || "Not provided"}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium">License Number</p>
											<p className="text-sm text-muted-foreground">{selectedDriver.licenseNumber}</p>
										</div>
									</div>

									{selectedDriver.car && (
										<>
											<Separator />
											<div>
												<p className="text-sm font-medium mb-2 flex items-center gap-1">
													<Car className="h-4 w-4" />
													Assigned Vehicle
												</p>
												<div className="flex items-center gap-2">
													<span className="text-sm">{selectedDriver.car.name}</span>
													<Badge variant="outline">{selectedDriver.car.licensePlate}</Badge>
													{selectedDriver.car.status && (
														<Badge variant={selectedDriver.car.status === "available" ? "default" : "secondary"}>
															{selectedDriver.car.status}
														</Badge>
													)}
												</div>
											</div>
										</>
									)}
								</CardContent>
							</Card>
						)}

						<DialogFooter>
							<Button 
								type="button" 
								variant="secondary" 
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting || !selectedDriverId}>
								{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Assign Driver
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}