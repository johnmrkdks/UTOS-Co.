import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { UserIcon, CameraIcon, SaveIcon, Loader2 } from "lucide-react";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useUpdateUserProfileMutation } from "@/hooks/customer/use-update-user-profile-mutation";
import { trpc } from "@/trpc";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function ProfilePage() {
	const { session } = useUserQuery();
	const { data: userProfile } = useQuery({
		...trpc.customerProfile.getProfile.queryOptions(),
		enabled: true
	});
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
	});

	const updateProfileMutation = useUpdateUserProfileMutation();

	// Update form data when session or user profile loads
	useEffect(() => {
		console.log("🔍 DEBUG: ProfilePage data loading");
		console.log("Session user:", session?.user);
		console.log("UserProfile query data:", userProfile);
		console.log("UserProfile user:", userProfile?.user);
		console.log("UserProfile user phone specifically:", userProfile?.user?.phone);
		console.log("Current formData before update:", formData);

		if (userProfile?.user) {
			// Prefer userProfile data as it includes phone field
			console.log("✅ Using userProfile data for form");
			console.log("Phone from userProfile:", userProfile.user.phone);
			console.log("Name from userProfile:", userProfile.user.name);
			console.log("Email from userProfile:", userProfile.user.email);

			const newFormData = {
				name: userProfile.user.name || "",
				email: userProfile.user.email || "",
				phone: userProfile.user.phone || "",
			};

			console.log("📝 Setting new form data:", newFormData);
			setFormData(newFormData);
		} else if (session?.user) {
			// Fallback to session data
			console.log("⚠️ Falling back to session data");
			console.log("Phone from session:", (session.user as any)?.phone);
			setFormData({
				name: session.user.name || "",
				email: session.user.email || "",
				phone: (session.user as any)?.phone || "",
			});
		} else {
			console.log("❌ No userProfile or session data available");
		}
	}, [session?.user, userProfile?.user]);

	const handleSave = async () => {
		try {
			console.log("🔄 Starting profile save process");
			console.log("Current form data:", formData);
			console.log("Current session user:", session?.user);

			// Prepare update data - only include fields that changed
			const updateData: any = {};
			let hasChanges = false;

			// Use userProfile data for comparison if available, otherwise fallback to session
			const currentUser = userProfile?.user || session?.user;

			if (formData.name !== currentUser?.name) {
				updateData.name = formData.name;
				hasChanges = true;
				console.log("📝 Name changed from:", currentUser?.name, "to:", formData.name);
			}

			if (formData.phone !== (currentUser as any)?.phone) {
				updateData.phone = formData.phone;
				hasChanges = true;
				console.log("📞 Phone changed from:", (currentUser as any)?.phone, "to:", formData.phone);
			}

			if (hasChanges) {
				console.log("⚡ Executing profile update with:", updateData);
				await updateProfileMutation.mutateAsync(updateData);
				console.log("✅ Profile update completed successfully");
			} else {
				console.log("⚠️ No changes detected, nothing to update");
			}

			setIsEditing(false);
		} catch (error) {
			// Errors are handled by the mutation hook
			console.error("❌ Error saving profile:", error);
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map(word => word[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="min-h-screen bg-gray-50/50">
			<div className="mx-auto max-w-4xl px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Profile</h1>
					<p className="text-gray-600">Manage your personal information and preferences</p>
				</div>

				<div className="grid gap-6">
					{/* Profile Picture Card - Hidden for now */}
					{/* <Card className="lg:col-span-1">
						<CardHeader className="text-center">
							<CardTitle>Profile Picture</CardTitle>
							<CardDescription>Update your profile photo</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-center">
								<div className="relative">
									<Avatar className="h-32 w-32">
										<AvatarImage src={session?.user.image || ""} alt="Profile" />
										<AvatarFallback className="text-2xl">
											{session?.user.name ? getInitials(session.user.name) : <UserIcon className="h-12 w-12" />}
										</AvatarFallback>
									</Avatar>
									<Button
										size="icon"
										variant="outline"
										className="absolute bottom-2 right-2 h-10 w-10 rounded-full border-2 border-white bg-white shadow-lg"
									>
										<CameraIcon className="h-4 w-4" />
									</Button>
								</div>
							</div>
							<div className="space-y-2">
								<Button variant="outline" className="w-full">
									Upload New Photo
								</Button>
								<Button variant="ghost" className="w-full text-destructive">
									Remove Photo
								</Button>
							</div>
						</CardContent>
					</Card> */}

					{/* Personal Information Card */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Personal Information</CardTitle>
								<CardDescription>Update your personal details and contact information</CardDescription>
							</div>
							{!isEditing && (
								<Button
									variant="outline"
									onClick={() => setIsEditing(true)}
									className="flex items-center gap-2"
								>
									Edit Profile
								</Button>
							)}
						</CardHeader>
						<CardContent className="space-y-6">
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

							{isEditing && (
								<div className="flex justify-end gap-2 border-t pt-4">
									<Button
										variant="outline"
										onClick={() => {
											setIsEditing(false);
											// Reset form data to current values
											const currentUser = userProfile?.user || session?.user;
											if (currentUser) {
												setFormData({
													name: currentUser.name || "",
													email: currentUser.email || "",
													phone: (currentUser as any)?.phone || "",
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
				</div>

				{/* Account Info Card */}
				<Card className="mt-6">
					<CardHeader>
						<CardTitle>Account Information</CardTitle>
						<CardDescription>View your account details and status</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<div>
								<Label className="text-sm font-medium text-gray-500">Account Type</Label>
								<p className="text-sm font-medium capitalize">{session?.user.role || "Customer"}</p>
							</div>
							<div>
								<Label className="text-sm font-medium text-gray-500">Member Since</Label>
								<p className="text-sm font-medium">
									{session?.user.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : "Unknown"}
								</p>
							</div>
							<div>
								<Label className="text-sm font-medium text-gray-500">Account Status</Label>
								<p className="text-sm font-medium text-green-600">Active</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}