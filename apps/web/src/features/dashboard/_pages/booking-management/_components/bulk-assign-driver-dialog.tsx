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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useGetAvailableDriversQuery } from "@/features/dashboard/_pages/drivers/_hooks/query/use-get-available-drivers-query";
import { useAssignDriverMutation } from "../_hooks/query/use-assign-driver-mutation";
import { Loader2, User } from "lucide-react";

const assignDriverSchema = z.object({
	driverId: z.string().min(1, "Please select a driver"),
});

type AssignDriverForm = z.infer<typeof assignDriverSchema>;

interface BulkAssignDriverDialogProps {
	bookingIds: string[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function BulkAssignDriverDialog({
	bookingIds,
	open,
	onOpenChange,
	onSuccess,
}: BulkAssignDriverDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const assignDriverMutation = useAssignDriverMutation();

	const availableDriversQuery = useGetAvailableDriversQuery({});

	const form = useForm<AssignDriverForm>({
		resolver: zodResolver(assignDriverSchema),
		defaultValues: {
			driverId: "",
		},
	});

	const onSubmit = async (data: AssignDriverForm) => {
		if (bookingIds.length === 0) return;

		setIsSubmitting(true);
		try {
			for (const bookingId of bookingIds) {
				await assignDriverMutation.mutateAsync({
					bookingId,
					driverId: data.driverId,
				});
			}
			form.reset();
			onOpenChange(false);
			onSuccess?.();
		} catch (error) {
			console.error("Failed to assign driver to bookings:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Assign Driver to {bookingIds.length} Booking(s)</DialogTitle>
					<DialogDescription>
						Select a driver to assign to all selected bookings. The same driver will be assigned to each booking.
					</DialogDescription>
				</DialogHeader>

				<Form {...(form as any)}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control as any}
							name="driverId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Driver</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
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

						<DialogFooter>
							<Button
								type="button"
								variant="secondary"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting || !form.watch("driverId")}>
								{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Assign to {bookingIds.length} Booking(s)
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
