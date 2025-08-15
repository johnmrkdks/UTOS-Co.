import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SimplifiedDriverOnboardingForm } from "@/features/dashboard/_pages/drivers/_components/simplified-driver-onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { useUserQuery } from '@/hooks/query/use-user-query';
import {
	CheckCircleIcon,
	AlertCircleIcon,
	MailIcon,
	ArrowLeftIcon,
	UserIcon,
	ShieldIcon,
	InfoIcon
} from "lucide-react";

export const Route = createFileRoute('/driver/_layout/onboarding')({
	component: DriverOnboardingComponent,
});

function DriverOnboardingComponent() {
	const navigate = useNavigate();
	const { session } = useUserQuery();

	const user = session?.user;

	const handleSuccess = () => {
		navigate({ to: '/driver' });
	};

	const handleBack = () => {
		navigate({ to: '/driver' });
	};

	// Check if email is verified
	const isEmailVerified = user?.emailVerified || false;

	if (!isEmailVerified) {
		return (
			<div className="max-w-2xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="outline" size="sm" onClick={handleBack}>
						<ArrowLeftIcon className="h-4 w-4" />
						Back to Dashboard
					</Button>
				</div>

				<Card className="border-yellow-200 bg-yellow-50">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
								<MailIcon className="h-6 w-6 text-yellow-600" />
							</div>
							<div>
								<CardTitle className="text-yellow-900">Email Verification Required</CardTitle>
								<CardDescription className="text-yellow-700">
									Please verify your email address before completing your driver profile
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="bg-white rounded-lg p-4 border border-yellow-200">
							<h3 className="font-medium text-yellow-900 mb-2">Why verify your email?</h3>
							<ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
								<li>Receive important notifications about your bookings</li>
								<li>Get updates on your driver application status</li>
								<li>Ensure secure access to your account</li>
								<li>Enable password reset functionality</li>
							</ul>
						</div>

						<div className="flex gap-3">
							<Button className="bg-yellow-600 hover:bg-yellow-700">
								<MailIcon className="h-4 w-4 mr-2" />
								Verify Email Now
							</Button>
							<Button variant="outline" onClick={() => navigate({ to: '/driver/settings' })}>
								Account Settings
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Button variant="outline" size="sm" onClick={handleBack}>
					<ArrowLeftIcon className="h-4 w-4" />
					Back to Dashboard
				</Button>
				<div className="text-right">
					<Badge variant="default" className="bg-green-100 text-green-800">
						<CheckCircleIcon className="h-3 w-3 mr-1" />
						Email Verified
					</Badge>
				</div>
			</div>

			{/* Welcome Message */}
			<Card className="border-green-200 bg-green-50">
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
							<UserIcon className="h-6 w-6 text-green-600" />
						</div>
						<div>
							<CardTitle className="text-green-900">Complete Your Driver Profile</CardTitle>
							<CardDescription className="text-green-700">
								Great! Your email is verified. Now let's complete your driver profile to get approved.
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-3 bg-white rounded-lg border border-green-200">
							<UserIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
							<h3 className="font-medium text-green-900">Personal Info</h3>
							<p className="text-xs text-green-700">Basic details & contact</p>
						</div>
						<div className="text-center p-3 bg-white rounded-lg border border-green-200">
							<ShieldIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
							<h3 className="font-medium text-green-900">License Details</h3>
							<p className="text-xs text-green-700">Driver's license information</p>
						</div>
						<div className="text-center p-3 bg-white rounded-lg border border-green-200">
							<AlertCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
							<h3 className="font-medium text-green-900">Emergency Contact</h3>
							<p className="text-xs text-green-700">Safety & support contact</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Important Notice */}
			<Card className="border-blue-200 bg-blue-50">
				<CardContent className="pt-6">
					<div className="flex items-start gap-3">
						<InfoIcon className="h-5 w-5 text-blue-600 mt-0.5" />
						<div className="text-sm text-blue-800">
							<h3 className="font-medium mb-1">Driver Onboarding Process</h3>
							<ul className="space-y-1 list-disc list-inside">
								<li>Complete all required fields in the 3-step form below</li>
								<li>Your application will be reviewed by our admin team</li>
								<li>You'll receive email notification about approval status</li>
								<li>Once approved, you can start accepting bookings</li>
								<li>Documents upload is optional and can be done later</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Main Onboarding Form */}
			<SimplifiedDriverOnboardingForm
				userId={user?.id || ""}
				onSuccess={handleSuccess}
			/>
		</div>
	);
}
