import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { useCreateDriverApplicationMutation } from "../_hooks/query/use-create-driver-application-mutation";
import { User, Phone, Calendar, MapPin, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
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

interface OnboardingStatus {
	step: number;
	completed: boolean;
	status: "pending" | "in_progress" | "completed";
}

interface SimplifiedDriverOnboardingFormProps {
	userId: string;
	onSuccess?: () => void;
}

export function SimplifiedDriverOnboardingForm({ userId, onSuccess }: SimplifiedDriverOnboardingFormProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const totalSteps = 3;
	
	const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
		step: 1,
		completed: false,
		status: "in_progress"
	});

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

	const createApplicationMutation = useCreateDriverApplicationMutation();

	const onSubmit = async (data: DriverApplicationFormData) => {
		try {
			// Validate required data
			if (!userId) {
				toast.error("User ID is required. Please try refreshing the page.");
				return;
			}

			if (!data.licenseExpiry || !data.dateOfBirth) {
				toast.error("Please fill in all required date fields.");
				return;
			}

			// Validate dates are valid
			const licenseExpiryDate = new Date(data.licenseExpiry);
			const dateOfBirthDate = new Date(data.dateOfBirth);

			if (isNaN(licenseExpiryDate.getTime()) || isNaN(dateOfBirthDate.getTime())) {
				toast.error("Please enter valid dates.");
				return;
			}

			console.log("Submitting driver application with data:", {
				userId,
				licenseNumber: data.licenseNumber,
				licenseExpiry: data.licenseExpiry, // Send as string
				phoneNumber: data.phoneNumber,
				emergencyContactName: data.emergencyContactName,
				emergencyContactPhone: data.emergencyContactPhone,
				address: data.address,
				dateOfBirth: data.dateOfBirth, // Send as string
			});

			await createApplicationMutation.mutateAsync({
				userId,
				licenseNumber: data.licenseNumber,
				licenseExpiry: data.licenseExpiry, // Send as string
				phoneNumber: data.phoneNumber,
				emergencyContactName: data.emergencyContactName,
				emergencyContactPhone: data.emergencyContactPhone,
				address: data.address,
				dateOfBirth: data.dateOfBirth, // Send as string
				// No documents for now
				licenseDocumentUrl: undefined,
				insuranceDocumentUrl: undefined,
				backgroundCheckDocumentUrl: undefined,
				profilePhotoUrl: undefined,
			});

			setOnboardingStatus({
				step: totalSteps,
				completed: true,
				status: "completed"
			});

			toast.success("Driver application submitted successfully! Your application is now pending admin review.");
			onSuccess?.();
		} catch (error) {
			console.error("Application error:", error);
			toast.error("Failed to submit application");
		}
	};

	const nextStep = () => {
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const getStepStatus = (step: number) => {
		if (step < currentStep) return "completed";
		if (step === currentStep) return "current";
		return "upcoming";
	};

	const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			{/* Progress Header */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-2xl">Driver Onboarding Process</CardTitle>
							<CardDescription>
								Complete these steps to become an approved driver
							</CardDescription>
						</div>
						<Badge variant={onboardingStatus.status === "completed" ? "default" : "secondary"} className="text-sm">
							{onboardingStatus.status === "completed" ? (
								<><CheckCircle className="h-4 w-4 mr-1" /> Submitted</>
							) : (
								<><Clock className="h-4 w-4 mr-1" /> Step {currentStep} of {totalSteps}</>
							)}
						</Badge>
					</div>
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>Progress</span>
							<span>{Math.round(progress)}% Complete</span>
						</div>
						<Progress value={progress} className="w-full" />
					</div>
				</CardHeader>
			</Card>

			{/* Step Navigation */}
			<div className="flex justify-center">
				<div className="flex items-center space-x-8">
					{[1, 2, 3].map((step) => {
						const status = getStepStatus(step);
						const stepTitles = ["Personal Info", "License Details", "Emergency Contact"];
						
						return (
							<div key={step} className="flex items-center">
								<div className="flex flex-col items-center">
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
											status === "completed"
												? "bg-green-500 text-white"
												: status === "current"
												? "bg-blue-500 text-white"
												: "bg-gray-200 text-gray-600"
										}`}
									>
										{status === "completed" ? <CheckCircle className="h-5 w-5" /> : step}
									</div>
									<span className={`mt-2 text-xs ${status === "current" ? "text-blue-600 font-medium" : "text-gray-500"}`}>
										{stepTitles[step - 1]}
									</span>
								</div>
								{step < totalSteps && (
									<div className={`w-20 h-0.5 mx-4 ${status === "completed" ? "bg-green-500" : "bg-gray-200"}`} />
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Form Content */}
			<Form {...form as any}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					{/* Step 1: Personal Information */}
					{currentStep === 1 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<User className="mr-2 h-5 w-5 text-blue-500" />
									Personal Information
								</CardTitle>
								<CardDescription>
									Let's start with your basic personal details
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<FormField
										control={form.control as any}
										name="phoneNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Phone Number</FormLabel>
												<FormControl>
													<Input placeholder="+61 4XX XXX XXX" {...field} />
												</FormControl>
												<FormDescription>
													We'll use this for important notifications
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control as any}
										name="dateOfBirth"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Date of Birth</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormDescription>
													Must be at least 18 years old to drive
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control as any}
									name="address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Residential Address</FormLabel>
											<FormControl>
												<Textarea 
													placeholder="Enter your full residential address" 
													rows={3}
													{...field} 
												/>
											</FormControl>
											<FormDescription>
												This helps us assign nearby bookings
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="flex justify-end">
									<Button 
										type="button" 
										onClick={nextStep}
										disabled={!form.watch("phoneNumber") || !form.watch("dateOfBirth") || !form.watch("address")}
									>
										Next: License Details
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Step 2: License Information */}
					{currentStep === 2 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<FileText className="mr-2 h-5 w-5 text-green-500" />
									Driver's License Information
								</CardTitle>
								<CardDescription>
									Enter your valid driver's license details
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
									<div className="flex items-start">
										<AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
										<div className="text-sm">
											<p className="font-medium text-yellow-800">License Requirements</p>
											<ul className="mt-1 text-yellow-700 list-disc list-inside space-y-1">
												<li>Valid Australian driver's license</li>
												<li>Must not expire within next 6 months</li>
												<li>Clean driving record preferred</li>
											</ul>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<FormField
										control={form.control as any}
										name="licenseNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel>License Number</FormLabel>
												<FormControl>
													<Input placeholder="Enter your license number" {...field} />
												</FormControl>
												<FormDescription>
													Found on the front of your license
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control as any}
										name="licenseExpiry"
										render={({ field }) => (
											<FormItem>
												<FormLabel>License Expiry Date</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormDescription>
													Must be valid for at least 6 months
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="flex justify-between">
									<Button type="button" variant="outline" onClick={prevStep}>
										Back
									</Button>
									<Button 
										type="button" 
										onClick={nextStep}
										disabled={!form.watch("licenseNumber") || !form.watch("licenseExpiry")}
									>
										Next: Emergency Contact
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Step 3: Emergency Contact */}
					{currentStep === 3 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Phone className="mr-2 h-5 w-5 text-red-500" />
									Emergency Contact Information
								</CardTitle>
								<CardDescription>
									Provide someone we can contact in case of emergency
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<div className="flex items-start">
										<AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
										<div className="text-sm text-blue-800">
											<p className="font-medium">Why we need this</p>
											<p className="mt-1">
												This person will be contacted only in emergencies or if we can't reach you during important situations.
											</p>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<FormField
										control={form.control as any}
										name="emergencyContactName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Emergency Contact Name</FormLabel>
												<FormControl>
													<Input placeholder="Full name of emergency contact" {...field} />
												</FormControl>
												<FormDescription>
													Preferably a family member or close friend
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control as any}
										name="emergencyContactPhone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Emergency Contact Phone</FormLabel>
												<FormControl>
													<Input placeholder="+61 4XX XXX XXX" {...field} />
												</FormControl>
												<FormDescription>
													Make sure this number is always reachable
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="bg-green-50 border border-green-200 rounded-lg p-4">
									<div className="flex items-start">
										<CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
										<div className="text-sm text-green-800">
											<p className="font-medium">Almost Done!</p>
											<p className="mt-1">
												After submission, an admin will review your application. You can track your status in the dashboard.
											</p>
										</div>
									</div>
								</div>

								<div className="flex justify-between">
									<Button type="button" variant="outline" onClick={prevStep}>
										Back
									</Button>
									<Button 
										type="submit" 
										disabled={createApplicationMutation.isPending}
										className="bg-green-600 hover:bg-green-700"
									>
										{createApplicationMutation.isPending ? "Submitting..." : "Submit Application"}
									</Button>
								</div>
							</CardContent>
						</Card>
					)}
				</form>
			</Form>

			{/* What Happens Next */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">What Happens Next?</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-4 bg-blue-50 rounded-lg">
							<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<Clock className="h-6 w-6 text-blue-600" />
							</div>
							<h3 className="font-semibold text-blue-900 mb-2">1. Application Review</h3>
							<p className="text-sm text-blue-700">Our team reviews your application within 2-3 business days</p>
						</div>
						
						<div className="text-center p-4 bg-yellow-50 rounded-lg">
							<div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<AlertCircle className="h-6 w-6 text-yellow-600" />
							</div>
							<h3 className="font-semibold text-yellow-900 mb-2">2. Admin Approval</h3>
							<p className="text-sm text-yellow-700">If approved, you'll receive confirmation and next steps</p>
						</div>
						
						<div className="text-center p-4 bg-green-50 rounded-lg">
							<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<CheckCircle className="h-6 w-6 text-green-600" />
							</div>
							<h3 className="font-semibold text-green-900 mb-2">3. Start Driving</h3>
							<p className="text-sm text-green-700">Once activated, you can start accepting bookings</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}