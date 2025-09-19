import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { useUpdateProfileMutation } from "@/hooks/auth/use-update-profile-mutation";
import { useUserQuery } from "@/hooks/query/use-user-query";
import {
	UserIcon,
	PhoneIcon,
	FileTextIcon,
	SaveIcon,
	Loader2,
} from "lucide-react";

interface PersonalInfoTabProps {
	driverProfile: any;
	userEmail?: string;
	userName?: string;
}

export function PersonalInfoTab({ driverProfile, userEmail, userName }: PersonalInfoTabProps) {
	const { session } = useUserQuery();
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
		dateOfBirth: "",
		emergencyContactName: "",
		emergencyContactPhone: "",
		licenseNumber: "",
		licenseExpiry: "",
	});

	const updateProfileMutation = useUpdateProfileMutation();

	// Update form data when session loads
	useEffect(() => {
		if (session?.user) {
			setFormData({
				name: session.user.name || "",
				email: session.user.email || "",
				phone: session.user.phone || driverProfile.personalInfo.phoneNumber || "",
				address: driverProfile.personalInfo.address || "",
				dateOfBirth: driverProfile.personalInfo.dateOfBirth || "",
				emergencyContactName: driverProfile.emergencyContact.name || "",
				emergencyContactPhone: driverProfile.emergencyContact.phone || "",
				licenseNumber: driverProfile.licenseInfo.number || "",
				licenseExpiry: driverProfile.licenseInfo.expiry || "",
			});
		}
	}, [session?.user, driverProfile]);

	const handleSave = async () => {
		try {
			console.log("🔄 Starting driver profile save process");
			console.log("Current form data:", formData);
			console.log("Current session user:", session?.user);

			// Prepare update data - only include fields that changed for basic profile (name, phone)
			const updateData: any = {};
			let hasChanges = false;

			if (formData.name !== session?.user?.name) {
				updateData.name = formData.name;
				hasChanges = true;
				console.log("📝 Name changed from:", session?.user?.name, "to:", formData.name);
			}

			if (formData.phone !== session?.user?.phone) {
				updateData.phone = formData.phone;
				hasChanges = true;
				console.log("📞 Phone changed from:", session?.user?.phone, "to:", formData.phone);
			}

			if (hasChanges) {
				console.log("⚡ Executing driver profile update with:", updateData);
				await updateProfileMutation.mutateAsync(updateData);
				console.log("✅ Driver profile update completed successfully");
			} else {
				console.log("⚠️ No changes detected, nothing to update");
			}

			setIsEditing(false);
		} catch (error) {
			// Errors are handled by the mutation hook
			console.error("❌ Error saving driver profile:", error);
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
					{!isEditing && (
						<Button
							variant="outline"
							onClick={() => setIsEditing(true)}
							size="sm"
						>
							Edit Profile
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Basic Information */}
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="name">Full Name</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
							disabled={!isEditing}
							placeholder="Enter your full name"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email Address</Label>
						<Input
							id="email"
							type="email"
							value={formData.email}
							disabled={true} // Email updates require Better Auth email change flow
							placeholder="Enter your email"
							className="bg-gray-50"
						/>
						<p className="text-xs text-gray-500">
							Email changes require verification and are handled through account settings.
						</p>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="phone">Phone Number</Label>
					<Input
						id="phone"
						type="tel"
						value={formData.phone}
						onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
						disabled={!isEditing}
						placeholder="Enter your phone number"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="dateOfBirth">Date of Birth</Label>
					<Input
						id="dateOfBirth"
						type="date"
						value={formData.dateOfBirth}
						onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
						disabled={!isEditing}
					/>
					<p className="text-xs text-gray-500">
						Additional information updates require admin approval.
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="address">Address</Label>
					<Textarea
						id="address"
						value={formData.address}
						onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
						disabled={!isEditing}
						rows={3}
						placeholder="Enter your address"
					/>
					<p className="text-xs text-gray-500">
						Address updates require admin approval.
					</p>
				</div>

				{/* License Information */}
				<div className="pt-4 border-t">
					<h3 className="text-base font-semibold mb-3 flex items-center gap-2">
						<FileTextIcon className="h-4 w-4" />
						License Information
					</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="licenseNumber">License Number</Label>
							<Input
								id="licenseNumber"
								value={formData.licenseNumber}
								onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
								disabled={!isEditing}
								placeholder="Enter license number"
							/>
							<p className="text-xs text-gray-500">
								License updates require admin approval.
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="licenseExpiry">License Expiry</Label>
							<Input
								id="licenseExpiry"
								type="date"
								value={formData.licenseExpiry}
								onChange={(e) => setFormData(prev => ({ ...prev, licenseExpiry: e.target.value }))}
								disabled={!isEditing}
							/>
							<p className="text-xs text-gray-500">
								License updates require admin approval.
							</p>
						</div>
					</div>
				</div>

				{/* Emergency Contact */}
				<div className="pt-4 border-t">
					<h3 className="text-base font-semibold mb-3 flex items-center gap-2">
						<PhoneIcon className="h-4 w-4" />
						Emergency Contact
					</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="emergencyContactName">Contact Name</Label>
							<Input
								id="emergencyContactName"
								value={formData.emergencyContactName}
								onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
								disabled={!isEditing}
								placeholder="Enter emergency contact name"
							/>
							<p className="text-xs text-gray-500">
								Emergency contact updates require admin approval.
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="emergencyContactPhone">Contact Phone</Label>
							<Input
								id="emergencyContactPhone"
								type="tel"
								value={formData.emergencyContactPhone}
								onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
								disabled={!isEditing}
								placeholder="Enter emergency contact phone"
							/>
							<p className="text-xs text-gray-500">
								Emergency contact updates require admin approval.
							</p>
						</div>
					</div>
				</div>

				{isEditing && (
					<div className="flex justify-end gap-2 border-t pt-4">
						<Button
							variant="outline"
							onClick={() => {
								setIsEditing(false);
								// Reset form data to current session values
								if (session?.user) {
									setFormData({
										name: session.user.name || "",
										email: session.user.email || "",
										phone: session.user.phone || driverProfile.personalInfo.phoneNumber || "",
										address: driverProfile.personalInfo.address || "",
										dateOfBirth: driverProfile.personalInfo.dateOfBirth || "",
										emergencyContactName: driverProfile.emergencyContact.name || "",
										emergencyContactPhone: driverProfile.emergencyContact.phone || "",
										licenseNumber: driverProfile.licenseInfo.number || "",
										licenseExpiry: driverProfile.licenseInfo.expiry || "",
									});
								}
							}}
							disabled={updateProfileMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							disabled={updateProfileMutation.isPending}
						>
							{updateProfileMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<SaveIcon className="mr-2 h-4 w-4" />
									Save Changes
								</>
							)}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}