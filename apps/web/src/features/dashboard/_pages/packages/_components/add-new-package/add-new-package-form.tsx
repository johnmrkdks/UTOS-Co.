import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { DialogClose, DialogFooter } from "@workspace/ui/components/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Progress } from "@workspace/ui/components/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useProxyUploadMutation } from "@/hooks/query/file/use-proxy-upload-mutation";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useCreatePackageMutation } from "../../_hooks/query/use-create-package-mutation";
import { useGetPackageServiceTypesQuery } from "../../_hooks/query/use-get-package-service-types-query";

const addPackageSchema = z.object({
	name: z.string().min(1, "Package name is required").max(100, "Name too long"),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(1000, "Description too long"),
	serviceTypeId: z.string().min(1, "Service type is required"),
	fixedPrice: z.number().min(0, "Price must be positive").optional(),
	hourlyRate: z.number().min(0, "Hourly rate must be positive").optional(),
	maxPassengers: z
		.number()
		.min(1, "Must allow at least 1 passenger")
		.default(4)
		.optional(),
	bannerImageUrl: z.string().optional(),
	// Optional fields that can be null/undefined in database
	categoryId: z.string().optional(),
	duration: z.number().optional(),
	maxDistance: z.number().optional(),
	extraKmPrice: z.number().optional(),
	extraHourPrice: z.number().optional(),
	depositRequired: z.number().optional(),
	advanceBookingHours: z.number().default(24),
	cancellationHours: z.number().default(24),
	includesDriver: z.boolean().default(true),
	includesFuel: z.boolean().default(true),
	includesTolls: z.boolean().default(false),
	includesWaiting: z.boolean().default(false),
	waitingTimeMinutes: z.number().default(0),
	availableDays: z.string().optional(),
	availableTimeStart: z.string().optional(),
	availableTimeEnd: z.string().optional(),
});

type AddPackageForm = z.infer<typeof addPackageSchema>;

type AddNewPackageFormProps = {
	className?: string;
	onSuccess?: () => void;
};

export function AddNewPackageForm({
	className,
	onSuccess,
}: AddNewPackageFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const createPackageMutation = useCreatePackageMutation();
	const proxyUploadMutation = useProxyUploadMutation();
	const uploadedBannerUrlRef = useRef<string | null>(null);
	const { data: serviceTypesData } = useGetPackageServiceTypesQuery();

	const serviceTypes = serviceTypesData?.data || [];

	const [
		{ files: imageFiles },
		{ addFiles, removeFile, openFileDialog, getInputProps },
	] = useFileUpload({
		maxFiles: 1,
		maxSize: 5 * 1024 * 1024, // 5MB
		accept: "image/*",
		multiple: false,
		onFilesAdded: async (newFiles) => {
			if (newFiles.length > 0) {
				await handleImageUpload(newFiles[0]);
			}
		},
	});

	const form = useForm<AddPackageForm>({
		resolver: zodResolver(addPackageSchema),
		defaultValues: {
			name: "",
			description: "",
			serviceTypeId: "",
			fixedPrice: undefined,
			hourlyRate: undefined,
			bannerImageUrl: "",
			// Set defaults for optional fields
			advanceBookingHours: 24,
			cancellationHours: 24,
			includesDriver: true,
			includesFuel: true,
			includesTolls: false,
			includesWaiting: false,
			waitingTimeMinutes: 0,
		},
	});

	// Watch the selected service type to determine pricing type
	const selectedServiceTypeId = form.watch("serviceTypeId");
	const selectedServiceType = useMemo(
		() => serviceTypes.find((type) => type.id === selectedServiceTypeId),
		[serviceTypes, selectedServiceTypeId],
	);
	const isHourlyRate = selectedServiceType?.rateType === "hourly";

	const handleImageUpload = async (fileWrapper: any) => {
		try {
			const file = fileWrapper.file as File;
			setUploadProgress(10);

			// Upload via server proxy (avoids R2 CORS issues)
			const result = await proxyUploadMutation.mutateAsync({
				entityType: "packages",
				file,
			});

			setUploadProgress(100);

			// Update form and ref so we never lose the URL (form state can lag)
			uploadedBannerUrlRef.current = result.imageUrl;
			form.setValue("bannerImageUrl", result.imageUrl, {
				shouldValidate: true,
			});
		} catch (error) {
			console.error("Image upload failed:", error);
			setUploadProgress(0);
			uploadedBannerUrlRef.current = null;
			removeFile(fileWrapper.id);
			toast.error("Image upload failed", {
				description:
					error instanceof Error ? error.message : "Please try again",
			});
		}
	};

	const onSubmit = async (data: AddPackageForm) => {
		console.log("📝 Form submission started");
		console.log("📊 Raw form data:", JSON.stringify(data, null, 2));

		setIsSubmitting(true);
		try {
			// Use ref for banner URL - form state can lag after setValue from async upload
			const bannerUrl = uploadedBannerUrlRef.current ?? data.bannerImageUrl;
			const packageData = {
				...data,
				bannerImageUrl: bannerUrl || undefined,
				fixedPrice: data.fixedPrice || null,
				hourlyRate: data.hourlyRate || null,
				maxPassengers: data.maxPassengers || 4, // Default to 4 if not set
			};

			console.log(
				"💰 Package data with prices in dollars:",
				JSON.stringify(packageData, null, 2),
			);
			console.log(
				"🖼️ Banner URL being sent:",
				packageData.bannerImageUrl || "(none)",
			);
			console.log("🚀 Calling createPackageMutation...");

			const result = await createPackageMutation.mutateAsync(packageData);

			console.log(
				"✅ Package created successfully:",
				JSON.stringify(result, null, 2),
			);

			uploadedBannerUrlRef.current = null;
			form.reset();
			onSuccess?.();
		} catch (error) {
			console.error("❌ Failed to create package:", error);
			console.error("📋 Error details:", {
				message: error instanceof Error ? error.message : "Unknown error",
				stack: error instanceof Error ? error.stack : undefined,
				data: JSON.stringify(data, null, 2),
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...(form as any)}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* Two-column layout */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
											rows={3}
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
									<FormLabel>Service Type</FormLabel>
									<FormControl>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select service type" />
											</SelectTrigger>
											<SelectContent>
												{serviceTypes.filter((type) => type.isActive).length >
												0 ? (
													serviceTypes
														.filter((type) => type.isActive)
														.sort(
															(a, b) =>
																(a.displayOrder || 0) - (b.displayOrder || 0),
														)
														.map((serviceType) => (
															<SelectItem
																key={serviceType.id}
																value={serviceType.id}
															>
																<div className="flex w-full items-center">
																	<span className="flex-1">
																		{serviceType.name}
																	</span>
																	<span className="ml-3 rounded bg-muted px-2 py-0.5 text-muted-foreground text-xs">
																		{serviceType.rateType === "hourly"
																			? "Hourly"
																			: "Fixed"}
																	</span>
																</div>
															</SelectItem>
														))
												) : (
													<div className="px-3 py-2 text-center text-muted-foreground text-sm">
														No active service types available
													</div>
												)}
											</SelectContent>
										</Select>
									</FormControl>
									<div className="mt-1 text-muted-foreground text-sm">
										Service Type defines the operational model for how this
										package functions.
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Dynamic pricing field - only show when service type is selected */}
						{selectedServiceType && (
							<div className="space-y-4">
								{isHourlyRate ? (
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
														{...field}
														value={field.value || ""}
														onChange={(e) => {
															const value = e.target.value;
															field.onChange(
																value === ""
																	? undefined
																	: Number.parseFloat(value) || undefined,
															);
														}}
													/>
												</FormControl>
												<div className="text-muted-foreground text-sm">
													Rate charged per hour for this service
												</div>
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
														{...field}
														value={field.value || ""}
														onChange={(e) => {
															const value = e.target.value;
															field.onChange(
																value === ""
																	? undefined
																	: Number.parseFloat(value) || undefined,
															);
														}}
													/>
												</FormControl>
												<div className="text-muted-foreground text-sm">
													Total fixed price for this service
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</div>
						)}
					</div>

					{/* Right Column - Image Upload & Settings */}
					<div className="space-y-4">
						{/* Banner Image Upload */}
						<FormField
							control={form.control as any}
							name="bannerImageUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Banner Image</FormLabel>
									<FormControl>
										<div className="space-y-3">
											{imageFiles.length > 0 || field.value ? (
												<div className="group relative">
													<img
														src={imageFiles[0]?.preview || field.value}
														alt="Package banner preview"
														className="h-40 w-full rounded-lg border object-cover"
														onError={(e) => {
															e.currentTarget.style.display = "none";
															e.currentTarget.nextElementSibling?.classList.remove(
																"hidden",
															);
														}}
													/>
													<div className="flex hidden h-40 w-full items-center justify-center rounded-lg border bg-muted">
														<p className="text-muted-foreground text-sm">
															Image not available
														</p>
													</div>
													{uploadProgress > 0 && uploadProgress < 100 && (
														<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
															<div className="min-w-[120px] space-y-2 rounded bg-white p-2">
																<Progress
																	value={uploadProgress}
																	className="h-2"
																/>
																<p className="text-center text-xs">
																	{uploadProgress}%
																</p>
															</div>
														</div>
													)}
													<Button
														type="button"
														variant="destructive"
														size="sm"
														className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
														onClick={() => {
															if (imageFiles[0]) removeFile(imageFiles[0].id);
															uploadedBannerUrlRef.current = null;
															field.onChange("");
															form.setValue("bannerImageUrl", "");
															setUploadProgress(0);
														}}
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
											) : (
												<div
													className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-300 border-dashed p-8 text-center transition-colors hover:border-gray-400"
													onClick={openFileDialog}
												>
													<Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
													<p className="text-gray-600 text-sm">
														Click to upload banner image
													</p>
													<p className="mt-1 text-gray-400 text-xs">
														PNG, JPG up to 5MB
													</p>
												</div>
											)}
											<input {...getInputProps()} />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary" size="sm" disabled={isSubmitting}>
							Cancel
						</Button>
					</DialogClose>
					<Button
						type="submit"
						size="sm"
						disabled={
							isSubmitting || (uploadProgress > 0 && uploadProgress < 100)
						}
					>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{uploadProgress > 0 && uploadProgress < 100
							? "Uploading..."
							: "Create Package"}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
