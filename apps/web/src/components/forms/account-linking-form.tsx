import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import {
	AlertCircle,
	CheckCircle,
	Eye,
	EyeOff,
	Key,
	Link,
	Loader2,
	Mail,
	Shield,
	Unlink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	useLinkSocialAccountMutation,
	useUnlinkAccountMutation,
} from "@/hooks/auth/use-link-account-mutations";
import { useSetPasswordMutation } from "@/hooks/auth/use-set-password-mutation";
import { useUserAccountsQuery } from "@/hooks/auth/use-user-accounts-query";
import { trpc } from "@/trpc";

// Google icon component
const GoogleIcon = ({ className }: { className?: string }) => (
	<svg className={className} viewBox="0 0 24 24" fill="currentColor">
		<path
			d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			fill="#4285F4"
		/>
		<path
			d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			fill="#34A853"
		/>
		<path
			d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			fill="#FBBC05"
		/>
		<path
			d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			fill="#EA4335"
		/>
	</svg>
);

const setPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain at least one uppercase letter, one lowercase letter, and one number",
			),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

interface AccountInfo {
	hasGoogleAccount: boolean;
	hasPasswordAccount: boolean;
	email?: string;
}

interface AccountLinkingFormProps {
	title?: string;
	description?: string;
	className?: string;
	userEmail?: string;
}

export const AccountLinkingForm = ({
	title = "Connected Accounts",
	description = "Manage your sign-in methods and account security",
	className = "",
	userEmail,
}: AccountLinkingFormProps) => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// All hooks must be called at the top level, before any conditional returns
	const { data: accountsData, isLoading, error } = useUserAccountsQuery();
	const linkGoogleMutation = useLinkSocialAccountMutation();
	const unlinkAccountMutation = useUnlinkAccountMutation();
	const setPasswordMutation = useSetPasswordMutation();
	const queryClient = useQueryClient();

	const form = useForm<SetPasswordFormData>({
		resolver: zodResolver(setPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	// Use real account info from server data
	const accountInfo: AccountInfo = {
		hasGoogleAccount:
			(accountsData as any)?.accountInfo?.hasGoogleAccount || false,
		hasPasswordAccount:
			(accountsData as any)?.accountInfo?.hasPasswordAccount || false,
		email: userEmail,
	};

	// Check if user just returned from OAuth linking
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);

		// Check for Better Auth OAuth success/error parameters
		if (
			urlParams.get("success") === "true" ||
			urlParams.get("linked") === "true"
		) {
			// Remove the parameter from URL
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.delete("success");
			newUrl.searchParams.delete("linked");
			window.history.replaceState({}, "", newUrl.toString());

			// Show success message and refresh data
			toast.success("Account linking completed!", {
				description: "Your Google account has been successfully linked.",
			});

			// Force refresh account data
			queryClient.invalidateQueries({
				queryKey: (trpc as any).auth.getUserAccounts.queryKey(),
			});
		} else if (urlParams.get("error")) {
			// Remove the parameter from URL
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.delete("error");
			window.history.replaceState({}, "", newUrl.toString());

			// Show error message
			toast.error("Account linking failed", {
				description:
					"There was an issue linking your Google account. Please try again.",
			});
		}
	}, [queryClient]);

	// Show loading state
	if (isLoading) {
		return (
			<Card className={className}>
				<CardContent className="flex items-center justify-center py-8">
					<div className="flex items-center gap-2">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span className="text-muted-foreground text-sm">
							Loading account information...
						</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Show error state
	if (error) {
		return (
			<Card className={className}>
				<CardContent className="flex items-center justify-center py-8">
					<div className="space-y-2 text-center">
						<AlertCircle className="mx-auto h-6 w-6 text-red-500" />
						<p className="text-muted-foreground text-sm">
							Failed to load account information
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const handleLinkGoogle = async () => {
		try {
			await linkGoogleMutation.mutateAsync({
				provider: "google",
				callbackURL: `${window.location.origin}${window.location.pathname}?linked=true`,
			});
		} catch (error) {
			// Error is handled by the mutation hook
		}
	};

	const handleUnlinkGoogle = async () => {
		try {
			await unlinkAccountMutation.mutateAsync({
				providerId: "google",
			});
		} catch (error) {
			// Error is handled by the mutation hook
		}
	};

	const handleSetPassword = async (data: SetPasswordFormData) => {
		try {
			await (setPasswordMutation as any).mutateAsync({
				password: data.password,
			});

			// Reset form on success
			form.reset();
		} catch (error) {
			// Error is handled by the mutation hook
		}
	};

	return (
		<Card className={className}>
			<CardHeader className="space-y-1">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
						<Link className="h-4 w-4 text-blue-600" />
					</div>
					<div>
						<CardTitle className="text-lg">{title}</CardTitle>
						<CardDescription className="text-sm">{description}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Account Status Overview */}
				<div className="space-y-3">
					<h3 className="font-medium text-sm">Current Sign-in Methods</h3>

					{/* Email/Password Account */}
					<div className="flex items-center justify-between rounded-lg border p-3">
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
								<Mail className="h-4 w-4 text-gray-600" />
							</div>
							<div>
								<p className="font-medium text-sm">Email & Password</p>
								<p className="text-gray-500 text-xs">
									{accountInfo.email || "Sign in with email and password"}
								</p>
							</div>
						</div>
						{accountInfo.hasPasswordAccount ? (
							<Badge
								variant="default"
								className="bg-green-100 text-green-700 text-xs"
							>
								<CheckCircle className="mr-1 h-3 w-3" />
								Active
							</Badge>
						) : (
							<Badge
								variant="secondary"
								className="bg-gray-100 text-gray-600 text-xs"
							>
								<AlertCircle className="mr-1 h-3 w-3" />
								Not Set
							</Badge>
						)}
					</div>

					{/* Google Account */}
					<div className="flex items-center justify-between rounded-lg border p-3">
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
								<GoogleIcon className="h-4 w-4" />
							</div>
							<div>
								<p className="font-medium text-sm">Google Account</p>
								<p className="text-gray-500 text-xs">
									Sign in with your Google account
								</p>
							</div>
						</div>
						{accountInfo.hasGoogleAccount ? (
							<Badge
								variant="default"
								className="bg-green-100 text-green-700 text-xs"
							>
								<CheckCircle className="mr-1 h-3 w-3" />
								Connected
							</Badge>
						) : (
							<Badge
								variant="secondary"
								className="bg-gray-100 text-gray-600 text-xs"
							>
								<Unlink className="mr-1 h-3 w-3" />
								Not Connected
							</Badge>
						)}
					</div>
				</div>

				{/* Password Setup for Google-only accounts */}
				{accountInfo.hasGoogleAccount && !accountInfo.hasPasswordAccount && (
					<>
						<Separator />
						<div className="space-y-4">
							<div>
								<h3 className="flex items-center gap-2 font-medium text-sm">
									<Key className="h-4 w-4" />
									Set Up Password
								</h3>
								<p className="mt-1 text-gray-500 text-xs">
									Add a password to your account so you can sign in with email
									and password.
								</p>
							</div>

							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(handleSetPassword)}
									className="space-y-3"
								>
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm">New Password</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															{...field}
															type={showPassword ? "text" : "password"}
															placeholder="Enter your password"
															disabled={setPasswordMutation.isPending}
															className="text-sm"
														/>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
															onClick={() => setShowPassword(!showPassword)}
															disabled={setPasswordMutation.isPending}
														>
															{showPassword ? (
																<EyeOff className="h-3 w-3" />
															) : (
																<Eye className="h-3 w-3" />
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
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm">
													Confirm Password
												</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															{...field}
															type={showConfirmPassword ? "text" : "password"}
															placeholder="Confirm your password"
															disabled={setPasswordMutation.isPending}
															className="text-sm"
														/>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
															onClick={() =>
																setShowConfirmPassword(!showConfirmPassword)
															}
															disabled={setPasswordMutation.isPending}
														>
															{showConfirmPassword ? (
																<EyeOff className="h-3 w-3" />
															) : (
																<Eye className="h-3 w-3" />
															)}
														</Button>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<Button
										type="submit"
										size="sm"
										disabled={setPasswordMutation.isPending}
										className="w-full"
									>
										{setPasswordMutation.isPending ? (
											<>
												<Loader2 className="mr-2 h-3 w-3 animate-spin" />
												Setting Password...
											</>
										) : (
											<>
												<Key className="mr-2 h-3 w-3" />
												Set Password
											</>
										)}
									</Button>
								</form>
							</Form>
						</div>
					</>
				)}

				{/* Google Account Linking */}
				{!accountInfo.hasGoogleAccount && accountInfo.hasPasswordAccount && (
					<>
						<Separator />
						<div className="space-y-4">
							<div>
								<h3 className="flex items-center gap-2 font-medium text-sm">
									<GoogleIcon className="h-4 w-4" />
									Connect Google Account
								</h3>
								<p className="mt-1 text-gray-500 text-xs">
									Link your Google account for faster sign-in and enhanced
									security.
								</p>
							</div>

							<div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
								<h4 className="mb-2 font-medium text-blue-900 text-sm">
									Benefits of connecting Google:
								</h4>
								<ul className="list-inside list-disc space-y-1 text-blue-800 text-xs">
									<li>Quick sign-in without remembering passwords</li>
									<li>Enhanced account security with Google's protection</li>
									<li>Seamless access across devices</li>
									<li>Backup authentication method</li>
								</ul>
							</div>

							<Button
								onClick={handleLinkGoogle}
								disabled={linkGoogleMutation.isPending}
								size="sm"
								className="w-full bg-red-600 hover:bg-red-700"
							>
								{linkGoogleMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-3 w-3 animate-spin" />
										Connecting...
									</>
								) : (
									<>
										<GoogleIcon className="mr-2 h-3 w-3" />
										Connect Google Account
									</>
								)}
							</Button>
						</div>
					</>
				)}

				{/* Unlink Google Account */}
				{accountInfo.hasGoogleAccount && accountInfo.hasPasswordAccount && (
					<>
						<Separator />
						<div className="space-y-4">
							<div>
								<h3 className="flex items-center gap-2 font-medium text-sm">
									<Unlink className="h-4 w-4" />
									Manage Connected Accounts
								</h3>
								<p className="mt-1 text-gray-500 text-xs">
									You have multiple sign-in methods connected. You can
									disconnect Google if you prefer to use only email and
									password.
								</p>
							</div>

							<Button
								onClick={handleUnlinkGoogle}
								disabled={unlinkAccountMutation.isPending}
								variant="outline"
								size="sm"
								className="w-full border-red-200 text-red-700 hover:bg-red-50"
							>
								{unlinkAccountMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-3 w-3 animate-spin" />
										Disconnecting...
									</>
								) : (
									<>
										<Unlink className="mr-2 h-3 w-3" />
										Disconnect Google Account
									</>
								)}
							</Button>
						</div>
					</>
				)}

				{/* Security Notice */}
				<div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
					<div className="flex items-start gap-2">
						<Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
						<div className="text-amber-800 text-sm">
							<p className="mb-1 font-medium">Security Tip</p>
							<p>
								Having multiple sign-in methods gives you backup options if you
								forget your password or lose access to one method.
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
