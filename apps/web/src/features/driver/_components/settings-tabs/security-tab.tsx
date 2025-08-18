import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@workspace/ui/components/form";
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import {
	KeyIcon,
	MailIcon,
	ShieldIcon,
	CheckCircleIcon,
	AlertCircleIcon,
	EyeIcon,
	EyeOffIcon,
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

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(8, "New password must be at least 8 characters"),
	confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

interface SecurityTabProps {
	user: any;
}

export function SecurityTab({ user }: SecurityTabProps) {
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
	const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

	const form = useForm<ChangePasswordForm>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

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
		<div className="space-y-4">
			{/* Account Status Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<ShieldIcon className="h-4 w-4" />
						Account Security Status
					</CardTitle>
					<CardDescription>
						Overview of your account security settings
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid grid-cols-1 gap-3">
						<div className="flex items-center justify-between p-3 border rounded-lg">
							<div className="flex items-center gap-3">
								<MailIcon className="h-4 w-4 text-gray-500" />
								<div>
									<p className="font-medium text-sm">Email Verification</p>
									<p className="text-xs text-gray-600 truncate">{user?.email}</p>
								</div>
							</div>
							{isEmailVerified ? (
								<Badge variant="default" className="bg-green-100 text-green-800 text-xs">
									<CheckCircleIcon className="h-3 w-3 mr-1" />
									Verified
								</Badge>
							) : (
								<Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
									<AlertCircleIcon className="h-3 w-3 mr-1" />
									Unverified
								</Badge>
							)}
						</div>

						<div className="flex items-center justify-between p-3 border rounded-lg">
							<div className="flex items-center gap-3">
								<GoogleIcon className="h-4 w-4 text-gray-500" />
								<div>
									<p className="font-medium text-sm">Google Account</p>
									<p className="text-xs text-gray-600">OAuth connection</p>
								</div>
							</div>
							{hasGoogleAccount ? (
								<Badge variant="default" className="bg-green-100 text-green-800 text-xs">
									<LinkIcon className="h-3 w-3 mr-1" />
									Connected
								</Badge>
							) : (
								<Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
									<UnlinkIcon className="h-3 w-3 mr-1" />
									Not Connected
								</Badge>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Password Change */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<KeyIcon className="h-4 w-4" />
						Change Password
					</CardTitle>
					<CardDescription>
						Update your password for better security
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleChangePassword)} className="space-y-3">
							<FormField
								control={form.control}
								name="currentPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm">Current Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showCurrentPassword ? "text" : "password"}
													placeholder="Enter your current password"
													{...field}
													className="text-sm"
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-2 py-1 hover:bg-transparent"
													onClick={() => setShowCurrentPassword(!showCurrentPassword)}
												>
													{showCurrentPassword ? (
														<EyeOffIcon className="h-3 w-3" />
													) : (
														<EyeIcon className="h-3 w-3" />
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
										<FormLabel className="text-sm">New Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showNewPassword ? "text" : "password"}
													placeholder="Enter your new password"
													{...field}
													className="text-sm"
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-2 py-1 hover:bg-transparent"
													onClick={() => setShowNewPassword(!showNewPassword)}
												>
													{showNewPassword ? (
														<EyeOffIcon className="h-3 w-3" />
													) : (
														<EyeIcon className="h-3 w-3" />
													)}
												</Button>
											</div>
										</FormControl>
										<FormDescription className="text-xs">
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
										<FormLabel className="text-sm">Confirm New Password</FormLabel>
										<FormControl>
											<Input
												type={showNewPassword ? "text" : "password"}
												placeholder="Confirm your new password"
												{...field}
												className="text-sm"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="pt-3">
								<Button
									type="submit"
									disabled={isChangingPassword}
									className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
									size="sm"
								>
									<KeyIcon className="h-3 w-3 mr-2" />
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
					<CardTitle className="flex items-center gap-2 text-base">
						<GoogleIcon className="h-4 w-4" />
						Google Account Connection
					</CardTitle>
					<CardDescription>
						Link your Google account for easier sign-in
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{hasGoogleAccount ? (
						<div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
									<GoogleIcon className="h-4 w-4 text-green-600" />
								</div>
								<div>
									<p className="font-medium text-green-900 text-sm">Google Account Connected</p>
									<p className="text-xs text-green-700">You can now sign in with Google</p>
								</div>
							</div>
							<Badge variant="default" className="bg-green-100 text-green-800 text-xs">
								<CheckCircleIcon className="h-3 w-3 mr-1" />
								Active
							</Badge>
						</div>
					) : (
						<div className="space-y-3">
							<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
								<h4 className="font-medium text-blue-900 mb-2 text-sm">Benefits of connecting Google:</h4>
								<ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
									<li>Quick sign-in without remembering passwords</li>
									<li>Enhanced account security with Google's protection</li>
									<li>Seamless access across devices</li>
									<li>Backup authentication method</li>
								</ul>
							</div>

							<Button
								onClick={handleConnectGoogle}
								disabled={isConnectingGoogle}
								className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
								size="sm"
							>
								<GoogleIcon className="h-3 w-3 mr-2" />
								{isConnectingGoogle ? "Connecting..." : "Connect Google Account"}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}