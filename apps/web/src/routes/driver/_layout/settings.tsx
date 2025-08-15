import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@workspace/ui/components/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useUserQuery } from '@/hooks/query/use-user-query';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import {
	SettingsIcon,
	KeyIcon,
	MailIcon,
	UserIcon,
	ShieldIcon,
	CheckCircleIcon,
	AlertCircleIcon,
	EyeIcon,
	EyeOffIcon,
	ArrowLeftIcon,
	LinkIcon,
	UnlinkIcon
} from "lucide-react";

// Google icon component since lucide-react doesn't have one
const GoogleIcon = ({ className }: { className?: string }) => (
	<svg className={className} viewBox="0 0 24 24" fill="currentColor">
		<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
		<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
		<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
		<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
	</svg>
);

export const Route = createFileRoute('/driver/_layout/settings')({
	component: DriverSettingsComponent,
});

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(8, "New password must be at least 8 characters"),
	confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

function DriverSettingsComponent() {
	const navigate = useNavigate();
	const { session } = useUserQuery();
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
	const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

	const user = session?.user;

	const form = useForm<ChangePasswordForm>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const handleBack = () => {
		navigate({ to: '/driver' });
	};

	const handleChangePassword = async (data: ChangePasswordForm) => {
		setIsChangingPassword(true);
		try {
			await authClient.changePassword({
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			});

			toast.success("Password changed successfully", {
				description: "Your password has been updated. You can now use your new password to log in.",
			});

			form.reset();
		} catch (error: any) {
			toast.error("Failed to change password", {
				description: error.message || "Please check your current password and try again.",
			});
		} finally {
			setIsChangingPassword(false);
		}
	};

	const handleConnectGoogle = async () => {
		setIsConnectingGoogle(true);
		try {
			// This would connect/link Google OAuth to existing account
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/driver/settings?connected=true",
			});
		} catch (error: any) {
			toast.error("Failed to connect Google account", {
				description: error.message || "Please try again.",
			});
			setIsConnectingGoogle(false);
		}
	};

	const handleVerifyEmail = async () => {
		setIsVerifyingEmail(true);
		try {
			// Send verification email
			await authClient.sendVerificationEmail({
				email: user?.email || "",
				callbackURL: "/driver/settings?verified=true",
			});

			toast.success("Verification email sent", {
				description: `Please check your email at ${user?.email} and click the verification link.`,
			});
		} catch (error: any) {
			toast.error("Failed to send verification email", {
				description: error.message || "Please try again.",
			});
		} finally {
			setIsVerifyingEmail(false);
		}
	};

	const isEmailVerified = user?.emailVerified || false;
	const hasGoogleAccount = user?.accounts?.some((account: any) => account.providerId === 'google') || false;

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Button variant="outline" size="sm" onClick={handleBack}>
					<ArrowLeftIcon className="h-4 w-4" />
					Back to Dashboard
				</Button>
				<div>
					<h1 className="text-2xl font-bold">Account Settings</h1>
					<p className="text-gray-600">Manage your account security and preferences</p>
				</div>
			</div>

			<Tabs defaultValue="security" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="security">Security</TabsTrigger>
					<TabsTrigger value="account">Account</TabsTrigger>
					<TabsTrigger value="notifications">Notifications</TabsTrigger>
				</TabsList>

				{/* Security Tab */}
				<TabsContent value="security" className="space-y-6">
					{/* Account Status Overview */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ShieldIcon className="h-5 w-5" />
								Account Security Status
							</CardTitle>
							<CardDescription>
								Overview of your account security settings
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div className="flex items-center gap-3">
										<MailIcon className="h-5 w-5 text-gray-500" />
										<div>
											<p className="font-medium">Email Verification</p>
											<p className="text-sm text-gray-600">{user?.email}</p>
										</div>
									</div>
									{isEmailVerified ? (
										<Badge variant="default" className="bg-green-100 text-green-800">
											<CheckCircleIcon className="h-3 w-3 mr-1" />
											Verified
										</Badge>
									) : (
										<Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
											<AlertCircleIcon className="h-3 w-3 mr-1" />
											Unverified
										</Badge>
									)}
								</div>

								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div className="flex items-center gap-3">
										<GoogleIcon className="h-5 w-5 text-gray-500" />
										<div>
											<p className="font-medium">Google Account</p>
											<p className="text-sm text-gray-600">OAuth connection</p>
										</div>
									</div>
									{hasGoogleAccount ? (
										<Badge variant="default" className="bg-green-100 text-green-800">
											<LinkIcon className="h-3 w-3 mr-1" />
											Connected
										</Badge>
									) : (
										<Badge variant="outline" className="bg-gray-100 text-gray-600">
											<UnlinkIcon className="h-3 w-3 mr-1" />
											Not Connected
										</Badge>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Email Verification */}
					{!isEmailVerified && (
						<Card className="border-yellow-200 bg-yellow-50">
							<CardHeader>
								<CardTitle className="text-yellow-900">Email Verification Required</CardTitle>
								<CardDescription className="text-yellow-700">
									Verify your email to ensure secure access to your account
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-start gap-3 mb-4">
									<AlertCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
									<div className="text-sm text-yellow-800">
										<p className="font-medium mb-1">Why verify your email?</p>
										<ul className="list-disc list-inside space-y-1">
											<li>Receive important booking notifications</li>
											<li>Enable password recovery</li>
											<li>Secure your account access</li>
											<li>Complete your driver profile</li>
										</ul>
									</div>
								</div>
								<Button
									onClick={handleVerifyEmail}
									disabled={isVerifyingEmail}
									className="bg-yellow-600 hover:bg-yellow-700"
								>
									<MailIcon className="h-4 w-4 mr-2" />
									{isVerifyingEmail ? "Sending..." : "Send Verification Email"}
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Password Change */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<KeyIcon className="h-5 w-5" />
								Change Password
							</CardTitle>
							<CardDescription>
								Update your password for better security
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(handleChangePassword)} className="space-y-4">
									<FormField
										control={form.control}
										name="currentPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Current Password</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															type={showCurrentPassword ? "text" : "password"}
															placeholder="Enter your current password"
															{...field}
														/>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
															onClick={() => setShowCurrentPassword(!showCurrentPassword)}
														>
															{showCurrentPassword ? (
																<EyeOffIcon className="h-4 w-4" />
															) : (
																<EyeIcon className="h-4 w-4" />
															)}
														</Button>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="newPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>New Password</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															type={showNewPassword ? "text" : "password"}
															placeholder="Enter your new password"
															{...field}
														/>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
															onClick={() => setShowNewPassword(!showNewPassword)}
														>
															{showNewPassword ? (
																<EyeOffIcon className="h-4 w-4" />
															) : (
																<EyeIcon className="h-4 w-4" />
															)}
														</Button>
													</div>
												</FormControl>
												<FormDescription>
													Password must be at least 8 characters long
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Confirm New Password</FormLabel>
												<FormControl>
													<Input
														type={showNewPassword ? "text" : "password"}
														placeholder="Confirm your new password"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="pt-4">
										<Button
											type="submit"
											disabled={isChangingPassword}
											className="bg-blue-600 hover:bg-blue-700"
										>
											<KeyIcon className="h-4 w-4 mr-2" />
											{isChangingPassword ? "Changing..." : "Change Password"}
										</Button>
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>

					{/* Google OAuth Connection */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<GoogleIcon className="h-5 w-5" />
								Google Account Connection
							</CardTitle>
							<CardDescription>
								Link your Google account for easier sign-in
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{hasGoogleAccount ? (
								<div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
											<GoogleIcon className="h-5 w-5 text-green-600" />
										</div>
										<div>
											<p className="font-medium text-green-900">Google Account Connected</p>
											<p className="text-sm text-green-700">You can now sign in with Google</p>
										</div>
									</div>
									<Badge variant="default" className="bg-green-100 text-green-800">
										<CheckCircleIcon className="h-3 w-3 mr-1" />
										Active
									</Badge>
								</div>
							) : (
								<div className="space-y-4">
									<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
										<h4 className="font-medium text-blue-900 mb-2">Benefits of connecting Google:</h4>
										<ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
											<li>Quick sign-in without remembering passwords</li>
											<li>Enhanced account security with Google's protection</li>
											<li>Seamless access across devices</li>
											<li>Backup authentication method</li>
										</ul>
									</div>

									<Button
										onClick={handleConnectGoogle}
										disabled={isConnectingGoogle}
										className="bg-red-600 hover:bg-red-700"
									>
										<GoogleIcon className="h-4 w-4 mr-2" />
										{isConnectingGoogle ? "Connecting..." : "Connect Google Account"}
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Account Tab */}
				<TabsContent value="account" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Account Information</CardTitle>
							<CardDescription>
								Your basic account details
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium">Full Name</label>
									<p className="text-sm text-gray-600">{user?.name}</p>
								</div>
								<div>
									<label className="text-sm font-medium">Email Address</label>
									<p className="text-sm text-gray-600">{user?.email}</p>
								</div>
								<div>
									<label className="text-sm font-medium">Account Role</label>
									<Badge variant="outline" className="w-fit capitalize">
										{user?.role}
									</Badge>
								</div>
								<div>
									<label className="text-sm font-medium">Member Since</label>
									<p className="text-sm text-gray-600">
										{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Notifications Tab */}
				<TabsContent value="notifications" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Notification Preferences</CardTitle>
							<CardDescription>
								Control how you receive updates and alerts
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<p className="text-sm text-gray-600">
									Notification settings will be available once your driver profile is complete and approved.
								</p>
								<Button variant="outline" disabled>
									Configure Notifications
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
