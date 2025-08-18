import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@workspace/ui/components/form";
import { toast } from 'sonner';
import {
	UserIcon,
	PhoneIcon,
	FileTextIcon,
	EditIcon,
	SaveIcon,
} from "lucide-react";

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

interface PersonalInfoTabProps {
	driverProfile: any;
	userEmail?: string;
	userName?: string;
}

export function PersonalInfoTab({ driverProfile, userEmail, userName }: PersonalInfoTabProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const form = useForm<ProfileForm>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: userName || "",
			email: userEmail || "",
			phoneNumber: driverProfile.personalInfo.phoneNumber,
			address: driverProfile.personalInfo.address,
			dateOfBirth: driverProfile.personalInfo.dateOfBirth,
			emergencyContactName: driverProfile.emergencyContact.name,
			emergencyContactPhone: driverProfile.emergencyContact.phone,
			licenseNumber: driverProfile.licenseInfo.number,
			licenseExpiry: driverProfile.licenseInfo.expiry,
		},
	});

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

	return (
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
						size="sm"
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
					<form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
						{/* Basic Information */}
						<div className="grid grid-cols-1 gap-4">
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
						<div className="pt-4 border-t">
							<h3 className="text-base font-semibold mb-3 flex items-center gap-2">
								<FileTextIcon className="h-4 w-4" />
								License Information
							</h3>
							<div className="grid grid-cols-1 gap-4">
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
						<div className="pt-4 border-t">
							<h3 className="text-base font-semibold mb-3 flex items-center gap-2">
								<PhoneIcon className="h-4 w-4" />
								Emergency Contact
							</h3>
							<div className="grid grid-cols-1 gap-4">
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
							<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
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
	);
}