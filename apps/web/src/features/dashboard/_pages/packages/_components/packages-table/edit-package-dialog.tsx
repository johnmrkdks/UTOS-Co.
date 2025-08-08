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
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useUpdatePackageMutation } from "../../_hooks/query/use-update-package-mutation";
import { Loader2 } from "lucide-react";

const editPackageSchema = z.object({
	name: z.string().min(1, "Package name is required").max(100, "Name too long"),
	description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
	pricePerDay: z.number().min(0, "Price must be positive"),
	isAvailable: z.boolean(),
});

type EditPackageForm = z.infer<typeof editPackageSchema>;

type EditPackageDialogProps = {
	package: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EditPackageDialog({ package: pkg, open, onOpenChange }: EditPackageDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const updatePackageMutation = useUpdatePackageMutation();

	const form = useForm<EditPackageForm>({
		resolver: zodResolver(editPackageSchema),
		defaultValues: {
			name: pkg?.name || "",
			description: pkg?.description || "",
			pricePerDay: pkg?.pricePerDay || 0,
			isAvailable: pkg?.isAvailable ?? true,
		},
	});

	const onSubmit = async (data: EditPackageForm) => {
		if (!pkg?.id) return;
		
		setIsSubmitting(true);
		try {
			await updatePackageMutation.mutateAsync({
				id: pkg.id,
				...data,
			});
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to update package:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Edit Package</DialogTitle>
					<DialogDescription>
						Update the package details. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Package Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter package name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea 
											placeholder="Describe the package services and features" 
											rows={3}
											{...field} 
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="pricePerDay"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Price Per Day (AUD)</FormLabel>
									<FormControl>
										<Input 
											type="number" 
											step="0.01" 
											min="0"
											placeholder="0.00" 
											{...field} 
											onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isAvailable"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
									<div className="space-y-0.5">
										<FormLabel>Available for Booking</FormLabel>
										<div className="text-sm text-muted-foreground">
											Customers can book this package
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

						<DialogFooter>
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
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}