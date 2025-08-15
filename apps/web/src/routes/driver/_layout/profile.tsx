import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@workspace/ui/components/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Progress } from "@workspace/ui/components/progress";
import { useUserQuery } from '@/hooks/query/use-user-query';
import { toast } from 'sonner';
import {
	UserIcon,
	MailIcon,
	PhoneIcon,
	MapPinIcon,
	CalendarIcon,
	FileTextIcon,
	CheckCircleIcon,
	AlertCircleIcon,
	EditIcon,
	SaveIcon,
	ArrowLeftIcon,
	ShieldCheckIcon,
	ClockIcon,
	CreditCardIcon,
	StarIcon,
	CarIcon,
	TrendingUpIcon
} from "lucide-react";

export const Route = createFileRoute('/driver/_layout/profile')({
	component: DriverProfileComponent,
});

const profileSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email format"),
	phoneNumber: z.string().min(1, "Phone number is required"),
	address: z.string().min(1, "Address is required"),
	dateOfBirth: z.string().min(1, "Date of birth is required"),
	emergencyContactName: z.string().min(1, "Emergency contact name is required"),
	emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
	licenseNumber: z.string().min(1, "License number is required"),
	licenseExpiry: z.string().min(1, "License expiry is required"),
});

type ProfileForm = z.infer<typeof profileSchema>;

function DriverProfileComponent() {
	const navigate = useNavigate();
	const { session } = useUserQuery();
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const user = session?.user;

	// Mock driver profile data - in real app, this would come from API
	const driverProfile = {
		personalInfo: {
			name: user?.name || "",
			email: user?.email || "",
			phoneNumber: "+61 412 345 678",
			address: "123 Collins Street, Melbourne VIC 3000",
			dateOfBirth: "1990-05-15",
		},
		emergencyContact: {
			name: "Sarah Johnson",
			phone: "+61 423 456 789",
		},
		licenseInfo: {
			number: "VIC123456789",
			expiry: "2025-12-31",
		},
		applicationStatus: {
			submitted: true,
			underReview: true,
			approved: false,
			active: false,
		},
		documents: {
			license: { uploaded: false, approved: false },
			insurance: { uploaded: false, approved: false },
			background: { uploaded: false, approved: false },
			photo: { uploaded: false, approved: false },
		},
		statistics: {
			totalTrips: 87,
			averageRating: 4.8,
			totalEarnings: 2850.50,
			memberSince: "2024-01-15",
		}
	};

	const form = useForm<ProfileForm>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: driverProfile.personalInfo.name,
			email: driverProfile.personalInfo.email,
			phoneNumber: driverProfile.personalInfo.phoneNumber,
			address: driverProfile.personalInfo.address,
			dateOfBirth: driverProfile.personalInfo.dateOfBirth,
			emergencyContactName: driverProfile.emergencyContact.name,
			emergencyContactPhone: driverProfile.emergencyContact.phone,
			licenseNumber: driverProfile.licenseInfo.number,
			licenseExpiry: driverProfile.licenseInfo.expiry,
		},
	});

	const handleBack = () => {
		navigate({ to: '/driver' });
	};

	const handleSave = async (data: ProfileForm) => {
		setIsSaving(true);
		try {
			// Update driver profile via API
			await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

			toast.success("Profile updated successfully", {
				description: "Your changes have been saved.",
			});

			setIsEditing(false);
		} catch (error) {
			toast.error("Failed to update profile", {
				description: "Please try again.",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const applicationSteps = [
		{ key: 'submitted', label: 'Application Submitted', completed: driverProfile.applicationStatus.submitted },
		{ key: 'underReview', label: 'Under Review', completed: driverProfile.applicationStatus.underReview },
		{ key: 'approved', label: 'Approved', completed: driverProfile.applicationStatus.approved },
		{ key: 'active', label: 'Active Driver', completed: driverProfile.applicationStatus.active },
	];

	const completedSteps = applicationSteps.filter(step => step.completed).length;
	const progressPercentage = (completedSteps / applicationSteps.length) * 100;

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Button variant="outline" size="sm" onClick={handleBack}>
					<ArrowLeftIcon className="h-4 w-4" />
					Back to Dashboard
				</Button>
				<div className="text-right">
					<h1 className="text-2xl font-bold">Driver Profile</h1>
					<p className="text-gray-600">Manage your driver information</p>
				</div>
			</div>

			{/* Application Status Overview */}
			<Card className="border-blue-200 bg-blue-50">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-blue-900">Application Status</CardTitle>
							<CardDescription className="text-blue-700">
								{completedSteps} of {applicationSteps.length} steps completed
							</CardDescription>
						</div>
						<Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
							{driverProfile.applicationStatus.active ? 'Active' :
								driverProfile.applicationStatus.approved ? 'Approved' :
									driverProfile.applicationStatus.underReview ? 'Under Review' : 'Pending'}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<Progress value={progressPercentage} className="w-full" />

					<div className="flex justify-between items-center">
						{applicationSteps.map((step, index) => (
							<div key={step.key} className="flex flex-col items-center text-center">
								<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step.completed
										? 'bg-green-500 text-white'
										: index === completedSteps
											? 'bg-blue-500 text-white'
											: 'bg-gray-200 text-gray-600'
									}`}>
									{step.completed ? <CheckCircleIcon className="h-4 w-4" /> : index + 1}
								</div>
								<span className="text-xs mt-1 text-center max-w-16">{step.label}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="personal" className="space-y-6">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="personal">Personal Info</TabsTrigger>
					<TabsTrigger value="documents">Documents</TabsTrigger>
					<TabsTrigger value="stats">Statistics</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</TabsList>

				{/* Personal Information Tab */}
				<TabsContent value="personal" className="space-y-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										<UserIcon className="h-5 w-5" />
										Personal Information
									</CardTitle>
									<CardDescription>
										Your basic personal details and contact information
									</CardDescription>
								</div>
								<Button
									variant={isEditing ? "default" : "outline"}
									onClick={() => setIsEditing(!isEditing)}
									disabled={isSaving}
								>
									{isEditing ? (
										<><SaveIcon className="h-4 w-4 mr-2" /> Cancel</>
									) : (
										<><EditIcon className="h-4 w-4 mr-2" /> Edit Profile</>
									)}
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
									{/* Basic Information */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Full Name</FormLabel>
													<FormControl>
														<Input {...field} disabled={!isEditing} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email Address</FormLabel>
													<FormControl>
														<Input {...field} disabled={true} />
													</FormControl>
													<FormDescription>
														Email changes must be done through account settings
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="phoneNumber"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Phone Number</FormLabel>
													<FormControl>
														<Input {...field} disabled={!isEditing} />
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
														<Input type="date" {...field} disabled={!isEditing} />
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
													<Textarea {...field} disabled={!isEditing} rows={3} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* License Information */}
									<div className="pt-6 border-t">
										<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
											<FileTextIcon className="h-5 w-5" />
											License Information
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<FormField
												control={form.control}
												name="licenseNumber"
												render={({ field }) => (
													<FormItem>
														<FormLabel>License Number</FormLabel>
														<FormControl>
															<Input {...field} disabled={!isEditing} />
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
														<FormLabel>License Expiry</FormLabel>
														<FormControl>
															<Input type="date" {...field} disabled={!isEditing} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>

									{/* Emergency Contact */}
									<div className="pt-6 border-t">
										<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
											<PhoneIcon className="h-5 w-5" />
											Emergency Contact
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<FormField
												control={form.control}
												name="emergencyContactName"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Contact Name</FormLabel>
														<FormControl>
															<Input {...field} disabled={!isEditing} />
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
														<FormLabel>Contact Phone</FormLabel>
														<FormControl>
															<Input {...field} disabled={!isEditing} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>

									{isEditing && (
										<div className="flex gap-3 pt-6 border-t">
											<Button
												type="submit"
												disabled={isSaving}
												className="bg-green-600 hover:bg-green-700"
											>
												<SaveIcon className="h-4 w-4 mr-2" />
												{isSaving ? "Saving..." : "Save Changes"}
											</Button>
											<Button
												type="button"
												variant="outline"
												onClick={() => setIsEditing(false)}
												disabled={isSaving}
											>
												Cancel
											</Button>
										</div>
									)}
								</form>
							</Form>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Documents Tab */}
				<TabsContent value="documents" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Required Documents</CardTitle>
							<CardDescription>
								Document verification is optional and can be completed later
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{Object.entries(driverProfile.documents).map(([key, doc]) => {
									const labels = {
										license: "Driver's License",
										insurance: "Insurance Certificate",
										background: "Background Check",
										photo: "Profile Photo"
									};

									return (
										<div key={key} className="flex items-center justify-between p-4 border rounded-lg">
											<div>
												<h4 className="font-medium">{labels[key as keyof typeof labels]}</h4>
												<p className="text-sm text-gray-600">
													{doc.uploaded ? "Document uploaded" : "Not uploaded"}
												</p>
											</div>
											<Badge variant={doc.uploaded ? "default" : "secondary"}>
												{doc.uploaded ? "Uploaded" : "Optional"}
											</Badge>
										</div>
									);
								})}
							</div>
							<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
								<p className="text-sm text-blue-800">
									<strong>Note:</strong> Documents are optional for now. You can complete your profile and start driving without uploading documents.
									We may request them later for verification purposes.
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Statistics Tab */}
				<TabsContent value="stats" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Trips</CardTitle>
								<CarIcon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{driverProfile.statistics.totalTrips}</div>
								<p className="text-xs text-muted-foreground">Completed rides</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Average Rating</CardTitle>
								<StarIcon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{driverProfile.statistics.averageRating}</div>
								<p className="text-xs text-muted-foreground">Out of 5.0</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
								<CreditCardIcon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">${driverProfile.statistics.totalEarnings}</div>
								<p className="text-xs text-muted-foreground">Lifetime earnings</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Member Since</CardTitle>
								<CalendarIcon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{new Date(driverProfile.statistics.memberSince).toLocaleDateString('en-AU', {
										month: 'short',
										year: 'numeric'
									})}
								</div>
								<p className="text-xs text-muted-foreground">Registration date</p>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Performance Overview</CardTitle>
							<CardDescription>Your driving statistics and performance metrics</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-center py-8">
								<TrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600">Detailed performance metrics will be available once you start driving.</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Settings Tab */}
				<TabsContent value="settings" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Profile Settings</CardTitle>
							<CardDescription>Configure your profile preferences</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<Button variant="outline" onClick={() => navigate({ to: '/driver/settings' })}>
									<ShieldCheckIcon className="h-4 w-4 mr-2" />
									Account Security Settings
								</Button>

								<div className="p-4 bg-gray-50 rounded-lg">
									<p className="text-sm text-gray-600">
										Additional profile settings will be available once your driver application is approved.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
