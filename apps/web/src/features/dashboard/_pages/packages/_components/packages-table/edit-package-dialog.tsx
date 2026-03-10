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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useMemo, useEffect } from "react";
import { useUpdatePackageMutation } from "../../_hooks/query/use-update-package-mutation";
import { useGetPackageServiceTypesQuery } from "../../_hooks/query/use-get-package-service-types-query";
import { Loader2 } from "lucide-react";

const editPackageSchema = z.object({
	name: z.string().min(1, "Package name is required").max(100, "Name too long"),
	description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
	serviceTypeId: z.string().min(1, "Service type is required"),
	fixedPrice: z.number().min(0, "Price must be positive").optional(),
	hourlyRate: z.number().min(0, "Hourly rate must be positive").optional(),
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
	const { data: serviceTypesData } = useGetPackageServiceTypesQuery();
	const serviceTypes = serviceTypesData?.data || [];

	const form = useForm<EditPackageForm>({
		resolver: zodResolver(editPackageSchema),
		defaultValues: {
			name: pkg?.name || "",
			description: pkg?.description || "",
			serviceTypeId: pkg?.serviceType?.id || pkg?.serviceTypeId || "",
			fixedPrice: pkg?.fixedPrice ?? undefined,
			hourlyRate: pkg?.hourlyRate ?? undefined,
			isAvailable: pkg?.isAvailable ?? true,
			isPublished: pkg?.isPublished ?? false,
		},
	});

	useEffect(() => {
		if (pkg && open) {
			form.reset({
				name: pkg.name || "",
				description: pkg.description || "",
				serviceTypeId: pkg.serviceType?.id || pkg.serviceTypeId || "",
				fixedPrice: pkg.fixedPrice ?? undefined,
				hourlyRate: pkg.hourlyRate ?? undefined,
				isAvailable: pkg.isAvailable ?? true,
				isPublished: pkg.isPublished ?? false,
			});
		}
	}, [pkg?.id, open, form]);

	const selectedServiceTypeId = form.watch("serviceTypeId");
	const selectedServiceType = useMemo(
		() => serviceTypes.find((t) => t.id === selectedServiceTypeId),
		[serviceTypes, selectedServiceTypeId]
	);
	const isHourlyRate = selectedServiceType?.rateType === "hourly";

	const onSubmit = async (data: EditPackageForm) => {
		if (!pkg?.id) return;

		setIsSubmitting(true);
		try {
			const updateData: Record<string, unknown> = {
				name: data.name,
				description: data.description,
				serviceTypeId: data.serviceTypeId,
				isAvailable: data.isAvailable,
				isPublished: data.isPublished,
			};

			if (isHourlyRate) {
				updateData.hourlyRate = data.hourlyRate ?? null;
				updateData.fixedPrice = null;
			} else {
				updateData.fixedPrice = data.fixedPrice ?? null;
				updateData.hourlyRate = null;
			}

			await updatePackageMutation.mutateAsync({
				id: pkg.id,
				data: updateData as any,
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
			<DialogContent className="sm:max-w-[700px]" showCloseButton={false}>
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
									name="serviceTypeId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Rate Type</FormLabel>
											<FormControl>
												<Select onValueChange={field.onChange} value={field.value}>
													<SelectTrigger>
														<SelectValue placeholder="Select rate type" />
													</SelectTrigger>
													<SelectContent>
														{serviceTypes
															.filter((t) => t.isActive)
															.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
															.map((serviceType) => (
																<SelectItem key={serviceType.id} value={serviceType.id}>
																	<div className="flex items-center gap-2">
																		<span>{serviceType.name}</span>
																		<span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
																			{serviceType.rateType === "hourly" ? "Hourly" : "Fixed"}
																		</span>
																	</div>
																</SelectItem>
															))}
													</SelectContent>
												</Select>
											</FormControl>
											<div className="text-xs text-muted-foreground">
												Change service type to switch between hourly and fixed rate pricing
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>

								{selectedServiceType && (
									isHourlyRate ? (
										<FormField
											control={form.control as any}
											name="hourlyRate"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Hourly Rate (AUD)</FormLabel>
													<FormControl>
														<Input
															type="number"
															step="0.01"
															min="0"
															placeholder="0.00"
															value={field.value ?? ""}
															onChange={(e) => {
																const v = e.target.value;
																field.onChange(v === "" ? undefined : parseFloat(v) || undefined);
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									) : (
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
															value={field.value ?? ""}
															onChange={(e) => {
																const v = e.target.value;
																field.onChange(v === "" ? undefined : parseFloat(v) || undefined);
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)
								)}
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
