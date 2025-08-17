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


	return (
		<div className="max-w-6xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Button variant="outline" size="sm" onClick={handleBack}>
					<ArrowLeftIcon className="h-4 w-4" />
					Back to Dashboard
				</Button>
			</div>

			{/* Welcome Message */}
			<Card className="border-blue-200 bg-blue-50">
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
							<UserIcon className="h-6 w-6 text-blue-600" />
						</div>
						<div>
							<CardTitle className="text-blue-900">Complete Your Driver Profile</CardTitle>
							<CardDescription className="text-blue-700">
								Let's complete your driver profile to submit your application for admin review.
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-3 bg-white rounded-lg border border-blue-200">
							<UserIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
							<h3 className="font-medium text-blue-900">Personal Info</h3>
							<p className="text-xs text-blue-700">Basic details & contact</p>
						</div>
						<div className="text-center p-3 bg-white rounded-lg border border-blue-200">
							<ShieldIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
							<h3 className="font-medium text-blue-900">License Details</h3>
							<p className="text-xs text-blue-700">Driver's license information</p>
						</div>
						<div className="text-center p-3 bg-white rounded-lg border border-blue-200">
							<AlertCircleIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
							<h3 className="font-medium text-blue-900">Emergency Contact</h3>
							<p className="text-xs text-blue-700">Safety & support contact</p>
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
							<h3 className="font-medium mb-1">Driver Application Process</h3>
							<ul className="space-y-1 list-disc list-inside">
								<li>Complete all required fields in the 3-step form below</li>
								<li>Your application will be submitted for admin review</li>
								<li>You can check your application status in the dashboard</li>
								<li>Once approved, you can start accepting bookings</li>
								<li>Documents upload is optional and can be done later</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Main Onboarding Form */}
			{user?.id ? (
				<SimplifiedDriverOnboardingForm
					userId={user.id}
					onSuccess={handleSuccess}
				/>
			) : (
				<Card className="border-yellow-200 bg-yellow-50">
					<CardContent className="pt-6">
						<div className="text-center">
							<AlertCircleIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
							<p className="text-yellow-800">Loading user information...</p>
							<p className="text-sm text-yellow-700 mt-1">Please wait while we load your profile.</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
