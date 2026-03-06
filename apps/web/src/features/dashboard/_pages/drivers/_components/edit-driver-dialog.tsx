import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Switch } from "@workspace/ui/components/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useUpdateDriverMutation } from "../_hooks/query/use-update-driver-mutation";
import { Loader2 } from "lucide-react";

const editDriverSchema = z.object({
	licenseNumber: z.string().min(1, "License number is required"),
	commissionRate: z.number().min(0).max(100),
	isActive: z.boolean(),
	isApproved: z.boolean(),
});

type EditDriverForm = z.infer<typeof editDriverSchema>;

type EditDriverDialogProps = {
	driver: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EditDriverDialog({ driver, open, onOpenChange }: EditDriverDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const updateDriverMutation = useUpdateDriverMutation();

	const form = useForm<EditDriverForm>({
		resolver: zodResolver(editDriverSchema),
		defaultValues: {
			licenseNumber: driver?.licenseNumber || "",
			commissionRate: driver?.commissionRate ?? 50,
			isActive: driver?.isActive ?? true,
			isApproved: driver?.isApproved ?? false,
		},
	});

	const onSubmit = async (data: EditDriverForm) => {
		if (!driver?.id) return;
		
		setIsSubmitting(true);
		try {
			await updateDriverMutation.mutateAsync({
				id: driver.id,
				...data,
			});
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to update driver:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Driver</DialogTitle>
					<DialogDescription>
						Update driver information and status.
					</DialogDescription>
				</DialogHeader>
				
				<Form {...form as any}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<p className="text-sm font-medium">Driver Information</p>
							<div className="text-sm text-muted-foreground">
								<p><strong>Name:</strong> {driver?.user?.name || "Unknown"}</p>
								<p><strong>Email:</strong> {driver?.user?.email || "Not provided"}</p>
								<p><strong>Phone:</strong> {driver?.user?.phone || "Not provided"}</p>
							</div>
						</div>

						<FormField
							control={form.control as any}
							name="licenseNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>License Number</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control as any}
							name="commissionRate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Commission Rate (%)</FormLabel>
									<FormControl>
										<Input
											type="number"
											min={0}
											max={100}
											value={field.value}
											onChange={(e) => {
												const v = parseInt(e.target.value, 10);
												field.onChange(isNaN(v) ? 50 : Math.min(100, Math.max(0, v)));
											}}
										/>
									</FormControl>
									<div className="text-xs text-muted-foreground">
										Driver&apos;s share of each job price (default 50%)
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control as any}
							name="isApproved"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
									<div className="space-y-0.5">
										<FormLabel>Approved Driver</FormLabel>
										<div className="text-sm text-muted-foreground">
											Driver is approved to take bookings
										</div>
									</div>
									<FormControl>
										<Switch 
											checked={field.value} 
											onCheckedChange={field.onChange} 
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control as any}
							name="isActive"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
									<div className="space-y-0.5">
										<FormLabel>Active Status</FormLabel>
										<div className="text-sm text-muted-foreground">
											Driver is currently active in the system
										</div>
									</div>
									<FormControl>
										<Switch 
											checked={field.value} 
											onCheckedChange={field.onChange} 
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<div className="flex justify-end space-x-2">
							<Button 
								type="button" 
								variant="secondary" 
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Save Changes
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}