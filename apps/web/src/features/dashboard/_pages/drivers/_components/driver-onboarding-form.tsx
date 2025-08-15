import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useCreatePresignedUrlMutation } from "@/hooks/query/file/use-create-presigned-url-mutation";
import { useUploadMutation } from "@/hooks/query/file/use-upload-mutation";
import { useCreateDriverApplicationMutation } from "../_hooks/query/use-create-driver-application-mutation";
import { Upload, FileText, Shield, User, Phone, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";

const driverApplicationSchema = z.object({
	licenseNumber: z.string().min(1, "License number is required"),
	licenseExpiry: z.string().min(1, "License expiry date is required"),
	phoneNumber: z.string().min(1, "Phone number is required"),
	emergencyContactName: z.string().min(1, "Emergency contact name is required"),
	emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
	address: z.string().min(1, "Address is required"),
	dateOfBirth: z.string().min(1, "Date of birth is required"),
});

type DriverApplicationFormData = z.infer<typeof driverApplicationSchema>;

interface DocumentUploadProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	onFileSelect: (file: File) => void;
	uploadUrl?: string;
	isUploading?: boolean;
}

function DocumentUpload({ title, description, icon, onFileSelect, uploadUrl, isUploading }: DocumentUploadProps) {
	const [fileState, fileActions] = useFileUpload({
		maxFiles: 1,
		accept: "image/*,.pdf",
		maxSize: 10 * 1024 * 1024, // 10MB
		onFilesAdded: (files) => {
			if (files[0]?.file instanceof File) {
				onFileSelect(files[0].file);
			}
		},
	});

	return (
		<Card className="border-dashed border-2">
			<CardContent className="p-6">
				<div className="flex items-center space-x-4">
					<div className="flex-shrink-0">
						{icon}
					</div>
					<div className="flex-1">
						<h3 className="font-medium">{title}</h3>
						<p className="text-sm text-muted-foreground">{description}</p>
						
						{fileState.files.length === 0 ? (
							<div
								className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
								onDragEnter={fileActions.handleDragEnter}
								onDragLeave={fileActions.handleDragLeave}
								onDragOver={fileActions.handleDragOver}
								onDrop={fileActions.handleDrop}
								onClick={fileActions.openFileDialog}
							>
								<Upload className="mx-auto h-8 w-8 text-gray-400" />
								<p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
								<p className="text-xs text-gray-500">PDF or images up to 10MB</p>
								<input {...fileActions.getInputProps()} className="hidden" />
							</div>
						) : (
							<div className="mt-4 space-y-2">
								{fileState.files.map((file) => (
									<div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
										<span className="text-sm font-medium">{file.file.name}</span>
										<div className="flex items-center space-x-2">
											{isUploading && (
												<div className="text-xs text-blue-600">Uploading...</div>
											)}
											{uploadUrl && (
												<div className="text-xs text-green-600">✓ Uploaded</div>
											)}
											<Button
												size="sm"
												variant="ghost"
												onClick={() => fileActions.removeFile(file.id)}
											>
												Remove
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
						
						{fileState.errors.length > 0 && (
							<div className="mt-2 space-y-1">
								{fileState.errors.map((error, index) => (
									<p key={index} className="text-sm text-red-600">{error}</p>
								))}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

interface DriverOnboardingFormProps {
	userId: string;
	onSuccess?: () => void;
}

export function DriverOnboardingForm({ userId, onSuccess }: DriverOnboardingFormProps) {
	const [uploadedDocuments, setUploadedDocuments] = useState<{
		license?: string;
		insurance?: string;
		backgroundCheck?: string;
		profilePhoto?: string;
	}>({});

	const form = useForm<DriverApplicationFormData>({
		resolver: zodResolver(driverApplicationSchema),
		defaultValues: {
			licenseNumber: "",
			licenseExpiry: "",
			phoneNumber: "",
			emergencyContactName: "",
			emergencyContactPhone: "",
			address: "",
			dateOfBirth: "",
		},
	});

	const createPresignedUrlMutation = useCreatePresignedUrlMutation();
	const uploadMutation = useUploadMutation();
	const createApplicationMutation = useCreateDriverApplicationMutation();

	const handleFileUpload = async (file: File, documentType: keyof typeof uploadedDocuments) => {
		try {
			// Get presigned URL
			const presignedResponse = await createPresignedUrlMutation.mutateAsync({
				entityType: "users",
				fileName: `${documentType}-${Date.now()}-${file.name}`,
				fileType: file.type,
				fileSize: file.size,
			});

			// Upload file
			await uploadMutation.mutateAsync({
				url: presignedResponse.url,
				file,
			});

			// Store the document URL
			setUploadedDocuments(prev => ({
				...prev,
				[documentType]: presignedResponse.key,
			}));

			toast.success("Document uploaded successfully");
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Failed to upload document");
		}
	};

	const onSubmit = async (data: DriverApplicationFormData) => {
		try {
			await createApplicationMutation.mutateAsync({
				userId,
				licenseNumber: data.licenseNumber,
				licenseExpiry: new Date(data.licenseExpiry),
				phoneNumber: data.phoneNumber,
				emergencyContactName: data.emergencyContactName,
				emergencyContactPhone: data.emergencyContactPhone,
				address: data.address,
				dateOfBirth: new Date(data.dateOfBirth),
				licenseDocumentUrl: uploadedDocuments.license,
				insuranceDocumentUrl: uploadedDocuments.insurance,
				backgroundCheckDocumentUrl: uploadedDocuments.backgroundCheck,
				profilePhotoUrl: uploadedDocuments.profilePhoto,
			});

			toast.success("Driver application submitted successfully");
			onSuccess?.();
		} catch (error) {
			console.error("Application error:", error);
			toast.error("Failed to submit application");
		}
	};

	const isUploading = createPresignedUrlMutation.isPending || uploadMutation.isPending;
	const isSubmitting = createApplicationMutation.isPending;

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			{/* Left Column - Form Inputs */}
			<div className="space-y-6">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Personal Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<User className="mr-2 h-5 w-5" />
									Personal Information
								</CardTitle>
								<CardDescription>
									Provide your basic personal details
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="phoneNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Phone Number</FormLabel>
												<FormControl>
													<Input placeholder="+61 4XX XXX XXX" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="dateOfBirth"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Date of Birth</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Address</FormLabel>
											<FormControl>
												<Textarea 
													placeholder="Full residential address" 
													{...field} 
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						{/* License Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<FileText className="mr-2 h-5 w-5" />
									License Information
								</CardTitle>
								<CardDescription>
									Enter your driver's license details
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="licenseNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel>License Number</FormLabel>
												<FormControl>
													<Input placeholder="License number" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="licenseExpiry"
										render={({ field }) => (
											<FormItem>
												<FormLabel>License Expiry Date</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Emergency Contact */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Phone className="mr-2 h-5 w-5" />
									Emergency Contact
								</CardTitle>
								<CardDescription>
									Provide emergency contact information
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="emergencyContactName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Emergency Contact Name</FormLabel>
												<FormControl>
													<Input placeholder="Full name" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="emergencyContactPhone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Emergency Contact Phone</FormLabel>
												<FormControl>
													<Input placeholder="+61 4XX XXX XXX" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>
					</form>
				</Form>
			</div>

			{/* Right Column - Document Uploads */}
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Shield className="mr-2 h-5 w-5" />
							Required Documents
						</CardTitle>
						<CardDescription>
							Upload all required documents for verification
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<DocumentUpload
							title="Driver's License"
							description="Upload a clear photo of your driver's license (front and back)"
							icon={<FileText className="h-8 w-8 text-blue-500" />}
							onFileSelect={(file) => handleFileUpload(file, "license")}
							uploadUrl={uploadedDocuments.license}
							isUploading={isUploading}
						/>

						<DocumentUpload
							title="Insurance Certificate"
							description="Upload your current insurance certificate"
							icon={<Shield className="h-8 w-8 text-green-500" />}
							onFileSelect={(file) => handleFileUpload(file, "insurance")}
							uploadUrl={uploadedDocuments.insurance}
							isUploading={isUploading}
						/>

						<DocumentUpload
							title="Background Check"
							description="Upload background check or police clearance"
							icon={<FileText className="h-8 w-8 text-purple-500" />}
							onFileSelect={(file) => handleFileUpload(file, "backgroundCheck")}
							uploadUrl={uploadedDocuments.backgroundCheck}
							isUploading={isUploading}
						/>

						<DocumentUpload
							title="Profile Photo"
							description="Upload a professional profile photo"
							icon={<User className="h-8 w-8 text-orange-500" />}
							onFileSelect={(file) => handleFileUpload(file, "profilePhoto")}
							uploadUrl={uploadedDocuments.profilePhoto}
							isUploading={isUploading}
						/>
					</CardContent>
				</Card>

				{/* Submit Button - Fixed at bottom of right column */}
				<Card>
					<CardContent className="pt-6">
						<Button
							onClick={form.handleSubmit(onSubmit)}
							disabled={isSubmitting || isUploading}
							className="w-full"
							size="lg"
						>
							{isSubmitting ? "Submitting Application..." : "Submit Application"}
						</Button>
						<p className="text-sm text-muted-foreground mt-2 text-center">
							Please ensure all information is accurate and all documents are uploaded before submitting.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}