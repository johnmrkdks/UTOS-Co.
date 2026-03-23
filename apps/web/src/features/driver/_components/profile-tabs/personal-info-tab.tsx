import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
	FileTextIcon,
	Loader2,
	PhoneIcon,
	SaveIcon,
	UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUpdateDriverProfileMutation } from "@/features/driver/_hooks/query/use-update-driver-profile-mutation";
import { useCurrentDriverQuery } from "@/hooks/query/use-current-driver-query";
import { useUserQuery } from "@/hooks/query/use-user-query";

interface PersonalInfoTabProps {
	driverProfile: any;
	userEmail?: string;
	userName?: string;
}

export function PersonalInfoTab({
	driverProfile,
	userEmail,
	userName,
}: PersonalInfoTabProps) {
	const { session } = useUserQuery();
	const { data: driverData } = useCurrentDriverQuery();
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

	const updateDriverProfileMutation = useUpdateDriverProfileMutation();

	// Update form data when session loads (driver data is optional)
	useEffect(() => {
		if (session?.user) {
			setFormData({
				name: session.user.name || "",
				email: session.user.email || "",
				phone: (session.user as any)?.phone || driverData?.phoneNumber || "",
				address: driverData?.address || "",
				dateOfBirth: driverData?.dateOfBirth
					? new Date(driverData.dateOfBirth).toISOString().split("T")[0]
					: "",
				emergencyContactName: driverData?.emergencyContactName || "",
				emergencyContactPhone: driverData?.emergencyContactPhone || "",
				licenseNumber: driverData?.licenseNumber || "",
				licenseExpiry: driverData?.licenseExpiry
					? new Date(driverData.licenseExpiry).toISOString().split("T")[0]
					: "",
			});
		}
	}, [session?.user, driverData]);

	const handleSave = async () => {
		try {
			console.log("🔄 Starting driver profile save process");
			console.log("Current form data:", formData);
			console.log("Current session user:", session?.user);
			console.log("Current driver data:", driverData);

			if (!driverData?.id) {
				console.log("⚠️ Cannot update driver data: no driver record found");
				return;
			}

			// Prepare comprehensive update data
			const currentDateOfBirth = driverData?.dateOfBirth
				? new Date(driverData.dateOfBirth).toISOString().split("T")[0]
				: "";
			const currentLicenseExpiry = driverData?.licenseExpiry
				? new Date(driverData.licenseExpiry).toISOString().split("T")[0]
				: "";

			const updateData: any = {
				driverId: driverData.id,
			};

			// Add user-related updates
			if (formData.name !== session?.user?.name) {
				updateData.name = formData.name;
				console.log(
					"📝 Name changed from:",
					session?.user?.name,
					"to:",
					formData.name,
				);
			}

			if (formData.phone !== (session?.user as any)?.phone) {
				updateData.phone = formData.phone;
				console.log(
					"📞 Phone changed from:",
					(session?.user as any)?.phone,
					"to:",
					formData.phone,
				);
			}

			// Add driver-specific updates
			if (formData.address !== driverData?.address) {
				updateData.address = formData.address;
				console.log(
					"🏠 Address changed from:",
					driverData?.address,
					"to:",
					formData.address,
				);
			}

			if (formData.dateOfBirth !== currentDateOfBirth) {
				updateData.dateOfBirth = formData.dateOfBirth
					? new Date(formData.dateOfBirth).getTime()
					: null;
				console.log(
					"📅 Date of birth changed from:",
					currentDateOfBirth,
					"to:",
					formData.dateOfBirth,
				);
			}

			if (formData.emergencyContactName !== driverData?.emergencyContactName) {
				updateData.emergencyContactName = formData.emergencyContactName;
				console.log(
					"👤 Emergency contact name changed from:",
					driverData?.emergencyContactName,
					"to:",
					formData.emergencyContactName,
				);
			}

			if (
				formData.emergencyContactPhone !== driverData?.emergencyContactPhone
			) {
				updateData.emergencyContactPhone = formData.emergencyContactPhone;
				console.log(
					"📞 Emergency contact phone changed from:",
					driverData?.emergencyContactPhone,
					"to:",
					formData.emergencyContactPhone,
				);
			}

			if (
				formData.licenseNumber !== driverData?.licenseNumber &&
				formData.licenseNumber
			) {
				updateData.licenseNumber = formData.licenseNumber;
				console.log(
					"🪪 License number changed from:",
					driverData?.licenseNumber,
					"to:",
					formData.licenseNumber,
				);
			}

			if (
				formData.licenseExpiry !== currentLicenseExpiry &&
				formData.licenseExpiry
			) {
				updateData.licenseExpiry = new Date(formData.licenseExpiry).getTime();
				console.log(
					"📅 License expiry changed from:",
					currentLicenseExpiry,
					"to:",
					formData.licenseExpiry,
				);
			}

			// Check if any changes were made
			const hasChanges = Object.keys(updateData).length > 1; // More than just driverId

			if (!hasChanges) {
				console.log("⚠️ No changes detected, nothing to update");
				setIsEditing(false);
				return;
			}

			// Execute the comprehensive update
			console.log(
				"⚡ Executing comprehensive driver profile update with:",
				updateData,
			);
			await updateDriverProfileMutation.mutateAsync(updateData);
			console.log("✅ Driver profile update completed successfully");

			setIsEditing(false);
		} catch (error) {
			// Errors are handled by the mutation hooks
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
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
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
						<p className="text-gray-500 text-xs">
							Email changes require verification and are handled through account
							settings.
						</p>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="phone">Phone Number</Label>
					<Input
						id="phone"
						type="tel"
						value={formData.phone}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, phone: e.target.value }))
						}
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
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))
						}
						disabled={!isEditing}
					/>
					<p className="text-gray-500 text-xs">
						Additional information updates require admin approval.
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="address">Address</Label>
					<Textarea
						id="address"
						value={formData.address}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, address: e.target.value }))
						}
						disabled={!isEditing}
						rows={3}
						placeholder="Enter your address"
					/>
					<p className="text-gray-500 text-xs">
						Address updates require admin approval.
					</p>
				</div>

				{/* License Information */}
				<div className="border-t pt-4">
					<h3 className="mb-3 flex items-center gap-2 font-semibold text-base">
						<FileTextIcon className="h-4 w-4" />
						License Information
					</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="licenseNumber">License Number</Label>
							<Input
								id="licenseNumber"
								value={formData.licenseNumber}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										licenseNumber: e.target.value,
									}))
								}
								disabled={!isEditing}
								placeholder="Enter license number"
							/>
							<p className="text-gray-500 text-xs">
								License updates require admin approval.
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="licenseExpiry">License Expiry</Label>
							<Input
								id="licenseExpiry"
								type="date"
								value={formData.licenseExpiry}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										licenseExpiry: e.target.value,
									}))
								}
								disabled={!isEditing}
							/>
							<p className="text-gray-500 text-xs">
								License updates require admin approval.
							</p>
						</div>
					</div>
				</div>

				{/* Emergency Contact */}
				<div className="border-t pt-4">
					<h3 className="mb-3 flex items-center gap-2 font-semibold text-base">
						<PhoneIcon className="h-4 w-4" />
						Emergency Contact
					</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="emergencyContactName">Contact Name</Label>
							<Input
								id="emergencyContactName"
								value={formData.emergencyContactName}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										emergencyContactName: e.target.value,
									}))
								}
								disabled={!isEditing}
								placeholder="Enter emergency contact name"
							/>
							<p className="text-gray-500 text-xs">
								Emergency contact updates require admin approval.
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="emergencyContactPhone">Contact Phone</Label>
							<Input
								id="emergencyContactPhone"
								type="tel"
								value={formData.emergencyContactPhone}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										emergencyContactPhone: e.target.value,
									}))
								}
								disabled={!isEditing}
								placeholder="Enter emergency contact phone"
							/>
							<p className="text-gray-500 text-xs">
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
										phone:
											(session.user as any)?.phone ||
											driverData?.phoneNumber ||
											"",
										address: driverData?.address || "",
										dateOfBirth: driverData?.dateOfBirth
											? new Date(driverData.dateOfBirth)
													.toISOString()
													.split("T")[0]
											: "",
										emergencyContactName:
											driverData?.emergencyContactName || "",
										emergencyContactPhone:
											driverData?.emergencyContactPhone || "",
										licenseNumber: driverData?.licenseNumber || "",
										licenseExpiry: driverData?.licenseExpiry
											? new Date(driverData.licenseExpiry)
													.toISOString()
													.split("T")[0]
											: "",
									});
								}
							}}
							disabled={updateDriverProfileMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							disabled={updateDriverProfileMutation.isPending}
						>
							{updateDriverProfileMutation.isPending ? (
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
