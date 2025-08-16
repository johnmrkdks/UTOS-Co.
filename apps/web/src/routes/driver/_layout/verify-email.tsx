import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { useUserQuery } from '@/hooks/query/use-user-query';
import { authClient } from '@/lib/auth-client';
import { useLinkGoogleAccount } from '@/hooks/auth/use-link-google-account';
import { toast } from 'sonner';
import {
	MailIcon,
	CheckCircleIcon,
	AlertCircleIcon,
	RefreshCwIcon,
	ArrowLeftIcon,
	InboxIcon,
	ShieldCheckIcon,
	LinkIcon
} from "lucide-react";

export const Route = createFileRoute('/driver/_layout/verify-email')({
	component: VerifyEmailComponent,
});

function VerifyEmailComponent() {
	const navigate = useNavigate();
	const { session } = useUserQuery();
	const [isResending, setIsResending] = useState(false);
	const linkGoogleAccount = useLinkGoogleAccount();

	const user = session?.user;

	const handleBack = () => {
		navigate({ to: '/driver' });
	};

	const handleResendVerification = async () => {
		setIsResending(true);
		try {
			await authClient.sendVerificationEmail({
				email: user?.email || "",
				callbackURL: "/driver?verified=true",
			});

			toast.success("Verification email sent!", {
				description: `Please check your email at ${user?.email} for the verification link.`,
			});
		} catch (error: any) {
			toast.error("Failed to send verification email", {
				description: error.message || "Please try again.",
			});
		} finally {
			setIsResending(false);
		}
	};

	const isEmailVerified = user?.emailVerified || false;

	if (isEmailVerified) {
		return (
			<div className="max-w-2xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="outline" size="sm" onClick={handleBack}>
						<ArrowLeftIcon className="h-4 w-4" />
						Back to Dashboard
					</Button>
				</div>

				<Card className="border-green-200 bg-green-50">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
								<CheckCircleIcon className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<CardTitle className="text-green-900">Email Already Verified!</CardTitle>
								<CardDescription className="text-green-700">
									Your email address has been successfully verified
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="bg-white rounded-lg p-4 border border-green-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-green-900">Email Status</p>
									<p className="text-sm text-green-700">{user?.email}</p>
								</div>
								<Badge variant="default" className="bg-green-100 text-green-800">
									<CheckCircleIcon className="h-3 w-3 mr-1" />
									Verified
								</Badge>
							</div>
						</div>

						<div className="flex gap-3">
							<Button onClick={() => navigate({ to: '/driver/onboarding' })}>
								Complete Driver Profile
							</Button>
							<Button variant="outline" onClick={handleBack}>
								Return to Dashboard
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<Button variant="outline" size="sm" onClick={handleBack}>
					<ArrowLeftIcon className="h-4 w-4" />
					Back to Dashboard
				</Button>
			</div>

			<Card className="border-blue-200 bg-blue-50">
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
							<MailIcon className="h-6 w-6 text-blue-600" />
						</div>
						<div>
							<CardTitle className="text-blue-900">Verify Your Email Address</CardTitle>
							<CardDescription className="text-blue-700">
								We've sent a verification link to your email address
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="bg-white rounded-lg p-4 border border-blue-200">
						<div className="flex items-center justify-between mb-3">
							<div>
								<p className="font-medium text-blue-900">Email Address</p>
								<p className="text-sm text-blue-700">{user?.email}</p>
							</div>
							<Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
								<AlertCircleIcon className="h-3 w-3 mr-1" />
								Unverified
							</Badge>
						</div>

						<div className="text-sm text-blue-800 space-y-2">
							<h4 className="font-medium">Why verify your email?</h4>
							<ul className="list-disc list-inside space-y-1">
								<li>Receive important notifications about bookings</li>
								<li>Get updates on your driver application status</li>
								<li>Enable password recovery and account security</li>
								<li>Complete your driver onboarding process</li>
							</ul>
						</div>
					</div>

					<div className="bg-white rounded-lg p-4 border border-blue-200">
						<div className="flex items-start gap-3">
							<InboxIcon className="h-5 w-5 text-blue-600 mt-0.5" />
							<div className="flex-1">
								<h4 className="font-medium text-blue-900 mb-2">Check Your Email</h4>
								<div className="text-sm text-blue-800 space-y-2">
									<p>We've sent a verification email to <strong>{user?.email}</strong></p>
									<p>Please:</p>
									<ol className="list-decimal list-inside space-y-1 ml-2">
										<li>Check your inbox (and spam folder)</li>
										<li>Click the verification link in the email</li>
										<li>Return here to continue your driver setup</li>
									</ol>
								</div>
							</div>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<Button
							onClick={handleResendVerification}
							disabled={isResending}
							className="bg-blue-600 hover:bg-blue-700"
						>
							<RefreshCwIcon className={`h-4 w-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
							{isResending ? "Sending..." : "Resend Verification Email"}
						</Button>

						<Button variant="outline" onClick={() => navigate({ to: '/driver/settings' })}>
							<ShieldCheckIcon className="h-4 w-4 mr-2" />
							Account Settings
						</Button>
					</div>

					{/* Google Account Linking Section */}
					<div className="bg-white rounded-lg p-4 border border-green-200">
						<div className="flex items-start gap-3">
							<LinkIcon className="h-5 w-5 text-green-600 mt-0.5" />
							<div className="flex-1">
								<h4 className="font-medium text-green-900 mb-2">🔗 Optional: Link Your Google Account</h4>
								<div className="text-sm text-green-800 space-y-2">
									<p>For easier access and enhanced security, you can link your Google account to your driver profile.</p>
									<p className="font-medium">Benefits:</p>
									<ul className="list-disc list-inside space-y-1 ml-2">
										<li>Sign in using Google in the future</li>
										<li>Enhanced account security</li>
										<li>Faster login process</li>
										<li>Backup authentication method</li>
									</ul>
								</div>
								<div className="mt-3">
									<Button
										variant="outline"
										size="sm"
										onClick={() => linkGoogleAccount.mutate()}
										disabled={linkGoogleAccount.isPending}
										className="border-green-200 text-green-700 hover:bg-green-50"
									>
										<LinkIcon className={`h-4 w-4 mr-2 ${linkGoogleAccount.isPending ? 'animate-spin' : ''}`} />
										{linkGoogleAccount.isPending ? "Connecting..." : "Link Google Account"}
									</Button>
								</div>
							</div>
						</div>
					</div>

					<div className="border-t pt-4">
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
							<div className="flex items-start gap-2">
								<AlertCircleIcon className="h-4 w-4 text-yellow-600 mt-0.5" />
								<div className="text-sm text-yellow-800">
									<p className="font-medium">Need help?</p>
									<p>If you don't receive the email within a few minutes, check your spam folder or contact our support team.</p>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
