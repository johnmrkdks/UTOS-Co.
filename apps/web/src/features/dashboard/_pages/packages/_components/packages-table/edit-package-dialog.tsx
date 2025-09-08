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
	fixedPrice: z.number().min(0, "Price must be positive"),
	isAvailable: z.boolean(),
	isPublished: z.boolean(),
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
			fixedPrice: pkg?.fixedPrice ? pkg.fixedPrice / 100 : 0, // Convert from cents to dollars for display
			isAvailable: pkg?.isAvailable ?? true,
			isPublished: pkg?.isPublished ?? false,
		},
	});

	const onSubmit = async (data: EditPackageForm) => {
		if (!pkg?.id) return;

		setIsSubmitting(true);
		try {
			await updatePackageMutation.mutateAsync({
				id: pkg.id,
				data: {
					...data,
					fixedPrice: Math.round(data.fixedPrice * 100), // Convert from dollars to cents for backend
				},
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
			<DialogContent className="sm:max-w-[700px]">
				<DialogHeader>
					<DialogTitle>Edit Package</DialogTitle>
					<DialogDescription>
						Update the package details. Click save when you're done.
					</DialogDescription>
				</DialogHeader>

				<Form {...form as any}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Two-column layout */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Left Column - Main Form Inputs */}
							<div className="space-y-4">
								<FormField
									control={form.control as any}
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
									control={form.control as any}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Describe the package services and features"
													rows={4}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control as any}
									name="fixedPrice"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Fixed Price (AUD)</FormLabel>
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
							</div>

							{/* Right Column - Settings */}
							<div className="space-y-4">
								<div>
									<h4 className="text-sm font-medium mb-3">Package Settings</h4>
									<div className="space-y-3">
										<FormField
											control={form.control as any}
											name="isAvailable"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="text-sm font-medium">Available for Booking</FormLabel>
														<div className="text-xs text-muted-foreground">
															Enable internal booking functionality
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
											name="isPublished"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="text-sm font-medium">Publish to Customers</FormLabel>
														<div className="text-xs text-muted-foreground">
															Make this package visible to public customers
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
									</div>
								</div>
							</div>
						</div>

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
