import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";
import {
	KeyIcon,
	ShieldIcon,
	BellIcon,
	SmartphoneIcon,
	MailIcon,
	ExternalLinkIcon,
	CheckCircleIcon,
	AlertCircleIcon
} from "lucide-react";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useState } from "react";
import { UpdatePasswordForm } from "@/components/forms/update-password-form";
import { AccountLinkingForm } from "@/components/forms/account-linking-form";

export function AccountSettingsPage() {
	const { session } = useUserQuery();

	const [notificationSettings, setNotificationSettings] = useState({
		emailNotifications: true,
		smsNotifications: false,
		bookingUpdates: true,
		promotionalEmails: false,
	});


	return (
		<div className="min-h-screen bg-gray-50/50">
			<div className="mx-auto max-w-4xl px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
					<p className="text-gray-600">Manage your security settings and account preferences</p>
				</div>

				<div className="space-y-6">
					{/* Security Section */}
					<UpdatePasswordForm
						title="Security & Authentication"
						description="Update your password to keep your account secure. This will sign you out of all other devices."
					/>

					{/* Account Linking Section */}
					<AccountLinkingForm
						userEmail={session?.user?.email}
					/>

					{/* Notification Settings - Hidden for now */}
					{/* <Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BellIcon className="h-5 w-5" />
								Notification Preferences
							</CardTitle>
							<CardDescription>
								Choose how you'd like to be notified about bookings and updates
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<MailIcon className="h-5 w-5 text-gray-400" />
										<div>
											<p className="font-medium">Email Notifications</p>
											<p className="text-sm text-gray-500">Receive booking updates via email</p>
										</div>
									</div>
									<Switch
										checked={notificationSettings.emailNotifications}
										onCheckedChange={(checked) =>
											setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
										}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<SmartphoneIcon className="h-5 w-5 text-gray-400" />
										<div>
											<p className="font-medium">SMS Notifications</p>
											<p className="text-sm text-gray-500">Receive important updates via text message</p>
										</div>
									</div>
									<Switch
										checked={notificationSettings.smsNotifications}
										onCheckedChange={(checked) =>
											setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
										}
									/>
								</div>

								<Separator />

								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Booking Status Updates</p>
										<p className="text-sm text-gray-500">Get notified when your booking status changes</p>
									</div>
									<Switch
										checked={notificationSettings.bookingUpdates}
										onCheckedChange={(checked) =>
											setNotificationSettings(prev => ({ ...prev, bookingUpdates: checked }))
										}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Promotional Emails</p>
										<p className="text-sm text-gray-500">Receive offers and news about our services</p>
									</div>
									<Switch
										checked={notificationSettings.promotionalEmails}
										onCheckedChange={(checked) =>
											setNotificationSettings(prev => ({ ...prev, promotionalEmails: checked }))
										}
									/>
								</div>
							</div>

							<div className="flex justify-end">
								<Button>Save Preferences</Button>
							</div>
						</CardContent>
					</Card> */}

					{/* Account Information */}
					<Card>
						<CardHeader>
							<CardTitle>Account Information</CardTitle>
							<CardDescription>View your account details and current status</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label className="text-sm font-medium text-gray-500">Account Email</Label>
									<p className="font-medium">{session?.user.email}</p>
								</div>
								<div className="space-y-2">
									<Label className="text-sm font-medium text-gray-500">Account Type</Label>
									<Badge variant="secondary" className="capitalize">
										{session?.user.role || "Customer"}
									</Badge>
								</div>
								<div className="space-y-2">
									<Label className="text-sm font-medium text-gray-500">Email Verified</Label>
									<div className="flex items-center gap-2">
										{session?.user.emailVerified ? (
											<>
												<CheckCircleIcon className="h-4 w-4 text-green-600" />
												<span className="text-sm text-green-600">Verified</span>
											</>
										) : (
											<>
												<AlertCircleIcon className="h-4 w-4 text-orange-600" />
												<span className="text-sm text-orange-600">Not verified</span>
												<Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
													Verify now
												</Button>
											</>
										)}
									</div>
								</div>
								<div className="space-y-2">
									<Label className="text-sm font-medium text-gray-500">Member Since</Label>
									<p className="font-medium">
										{session?.user.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : "Unknown"}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}