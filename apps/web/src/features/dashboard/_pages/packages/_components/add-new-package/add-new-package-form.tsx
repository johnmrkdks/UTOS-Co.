import { Button } from "@workspace/ui/components/button";
import { DialogClose, DialogFooter } from "@workspace/ui/components/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useCreatePackageMutation } from "../../_hooks/query/use-create-package-mutation";
import { useGetPackageServiceTypesQuery } from "../../_hooks/query/use-get-package-service-types-query";
import { Loader2, Upload, X } from "lucide-react";
import { Progress } from "@workspace/ui/components/progress";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useCreatePresignedUrlMutation } from "@/hooks/query/file/use-create-presigned-url-mutation";
import { useUploadMutation } from "@/hooks/query/file/use-upload-mutation";

const addPackageSchema = z.object({
	name: z.string().min(1, "Package name is required").max(100, "Name too long"),
	description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
	serviceTypeId: z.string().min(1, "Service type is required"),
	fixedPrice: z.number().min(0, "Price must be positive"),
	maxPassengers: z.number().min(1, "Must allow at least 1 passenger").default(4),
	isAvailable: z.boolean().default(true),
	isPublished: z.boolean().default(false),
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

export function AddNewPackageForm({ className, onSuccess }: AddNewPackageFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const createPackageMutation = useCreatePackageMutation();
	const createPresignedUrlMutation = useCreatePresignedUrlMutation();
	const uploadMutation = useUploadMutation();
	const { data: serviceTypesData } = useGetPackageServiceTypesQuery();

	const serviceTypes = serviceTypesData?.data || [];
	
	const [{ files: imageFiles }, { addFiles, removeFile, openFileDialog, getInputProps }] = useFileUpload({
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
			fixedPrice: 0,
			maxPassengers: 4,
			isAvailable: true,
			isPublished: false,
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

	const handleImageUpload = async (fileWrapper: any) => {
		try {
			const file = fileWrapper.file as File;
			setUploadProgress(10);

			// Get presigned URL
			const presignedData = await createPresignedUrlMutation.mutateAsync({
				entityType: "packages",
				fileName: file.name,
				fileType: file.type,
				fileSize: file.size,
			});

			setUploadProgress(50);

			// Upload file to R2
			await uploadMutation.mutateAsync({
				url: presignedData.url,
				file,
			});

			setUploadProgress(100);

			// Update form with image URL
			form.setValue("bannerImageUrl", presignedData.imageUrl);
			
		} catch (error) {
			console.error("Image upload failed:", error);
			setUploadProgress(0);
		}
	};

	const onSubmit = async (data: AddPackageForm) => {
		console.log("📝 Form submission started");
		console.log("📊 Raw form data:", JSON.stringify(data, null, 2));
		
		setIsSubmitting(true);
		try {
			// Convert price to cents for storage
			const packageData = {
				...data,
				fixedPrice: Math.round(data.fixedPrice * 100), // Convert to cents
			};
			
			console.log("💰 Package data with price converted to cents:", JSON.stringify(packageData, null, 2));
			console.log("🚀 Calling createPackageMutation...");
			
			const result = await createPackageMutation.mutateAsync(packageData);
			
			console.log("✅ Package created successfully:", JSON.stringify(result, null, 2));
			
			form.reset();
			onSuccess?.();
		} catch (error) {
			console.error("❌ Failed to create package:", error);
			console.error("📋 Error details:", {
				message: error instanceof Error ? error.message : 'Unknown error',
				stack: error instanceof Error ? error.stack : undefined,
				data: JSON.stringify(data, null, 2)
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* Two-column layout */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left Column - Main Form Inputs */}
					<div className="space-y-4">
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
							name="serviceTypeId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Service Type</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<SelectTrigger>
												<SelectValue placeholder="Select service type" />
											</SelectTrigger>
											<SelectContent>
												{serviceTypes
													.filter(type => type.isActive)
													.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
													.map((serviceType) => (
														<SelectItem key={serviceType.id} value={serviceType.id}>
															{serviceType.icon && `${serviceType.icon} `}{serviceType.name}
														</SelectItem>
													))
												}
											</SelectContent>
										</Select>
									</FormControl>
									<div className="text-sm text-muted-foreground mt-1">
										Service Type defines the operational model for how this package functions.
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
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

							<FormField
								control={form.control}
								name="maxPassengers"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Max Passengers</FormLabel>
										<FormControl>
											<Input 
												type="number" 
												min="1"
												max="20"
												placeholder="4" 
												{...field} 
												onChange={(e) => field.onChange(parseInt(e.target.value) || 4)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* Right Column - Image Upload & Settings */}
					<div className="space-y-4">
						{/* Banner Image Upload */}
						<FormField
							control={form.control}
							name="bannerImageUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Banner Image</FormLabel>
									<FormControl>
										<div className="space-y-3">
											{imageFiles.length > 0 ? (
												<div className="relative group">
													<img
														src={imageFiles[0].preview}
														alt="Package banner preview"
														className="w-full h-40 object-cover rounded-lg border"
													/>
													{uploadProgress > 0 && uploadProgress < 100 && (
														<div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
															<div className="bg-white p-2 rounded space-y-2 min-w-[120px]">
																<Progress value={uploadProgress} className="h-2" />
																<p className="text-xs text-center">{uploadProgress}%</p>
															</div>
														</div>
													)}
													<Button
														type="button"
														variant="destructive"
														size="sm"
														className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
														onClick={() => {
															removeFile(imageFiles[0].id);
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
													className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors h-40 flex flex-col items-center justify-center"
													onClick={openFileDialog}
												>
													<Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
													<p className="text-sm text-gray-600">Click to upload banner image</p>
													<p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
												</div>
											)}
											<input {...getInputProps()} />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Settings Section */}
						<div className="space-y-4">
							<div>
								<h4 className="text-sm font-medium mb-3">Package Settings</h4>
								<div className="space-y-3">
									<FormField
										control={form.control}
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
										control={form.control}
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
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary" size="sm" disabled={isSubmitting}>
							Cancel
						</Button>
					</DialogClose>
					<Button type="submit" size="sm" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Create Package
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
