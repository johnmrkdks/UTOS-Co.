import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { UserIcon, CameraIcon, SaveIcon } from "lucide-react";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useState } from "react";

export function ProfilePage() {
	const { session } = useUserQuery();
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: session?.user.name || "",
		email: session?.user.email || "",
		phone: "",
		bio: "",
	});

	const handleSave = () => {
		// TODO: Implement profile update mutation
		console.log("Saving profile:", formData);
		setIsEditing(false);
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

				<div className="grid gap-6 lg:grid-cols-3">
					{/* Profile Picture Card */}
					<Card className="lg:col-span-1">
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
					</Card>

					{/* Personal Information Card */}
					<Card className="lg:col-span-2">
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Personal Information</CardTitle>
								<CardDescription>Update your personal details and contact information</CardDescription>
							</div>
							<Button
								variant={isEditing ? "default" : "outline"}
								onClick={isEditing ? handleSave : () => setIsEditing(true)}
								className="flex items-center gap-2"
							>
								{isEditing ? (
									<>
										<SaveIcon className="h-4 w-4" />
										Save Changes
									</>
								) : (
									"Edit Profile"
								)}
							</Button>
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
										onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
										disabled={!isEditing}
										placeholder="Enter your email"
									/>
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
								<Label htmlFor="bio">Bio</Label>
								<Textarea
									id="bio"
									value={formData.bio}
									onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
									disabled={!isEditing}
									placeholder="Tell us a bit about yourself..."
									className="min-h-20"
								/>
							</div>

							{isEditing && (
								<div className="flex justify-end gap-2 border-t pt-4">
									<Button variant="outline" onClick={() => setIsEditing(false)}>
										Cancel
									</Button>
									<Button onClick={handleSave}>
										<SaveIcon className="mr-2 h-4 w-4" />
										Save Changes
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