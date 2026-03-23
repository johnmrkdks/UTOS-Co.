import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
	AlertCircleIcon,
	ArrowLeftIcon,
	CheckCircleIcon,
	InfoIcon,
	MailIcon,
	ShieldIcon,
	UserIcon,
} from "lucide-react";
import { SimplifiedDriverOnboardingForm } from "@/features/dashboard/_pages/drivers/_components/simplified-driver-onboarding-form";
import { useUserQuery } from "@/hooks/query/use-user-query";

export const Route = createFileRoute("/driver/_layout/onboarding")({
	component: DriverOnboardingComponent,
});

function DriverOnboardingComponent() {
	const navigate = useNavigate();
	const { session } = useUserQuery();

	const user = session?.user;

	const handleSuccess = () => {
		navigate({ to: "/driver" });
	};

	const handleBack = () => {
		navigate({ to: "/driver" });
	};

	return (
		<div className="mx-auto max-w-6xl space-y-6">
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
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
							<UserIcon className="h-6 w-6 text-blue-600" />
						</div>
						<div>
							<CardTitle className="text-blue-900">
								Complete Your Driver Profile
							</CardTitle>
							<CardDescription className="text-blue-700">
								Let's complete your driver profile to submit your application
								for admin review.
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div className="rounded-lg border border-blue-200 bg-white p-3 text-center">
							<UserIcon className="mx-auto mb-2 h-8 w-8 text-blue-600" />
							<h3 className="font-medium text-blue-900">Personal Info</h3>
							<p className="text-blue-700 text-xs">Basic details & contact</p>
						</div>
						<div className="rounded-lg border border-blue-200 bg-white p-3 text-center">
							<ShieldIcon className="mx-auto mb-2 h-8 w-8 text-blue-600" />
							<h3 className="font-medium text-blue-900">License Details</h3>
							<p className="text-blue-700 text-xs">
								Driver's license information
							</p>
						</div>
						<div className="rounded-lg border border-blue-200 bg-white p-3 text-center">
							<AlertCircleIcon className="mx-auto mb-2 h-8 w-8 text-blue-600" />
							<h3 className="font-medium text-blue-900">Emergency Contact</h3>
							<p className="text-blue-700 text-xs">Safety & support contact</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Important Notice */}
			<Card className="border-blue-200 bg-blue-50">
				<CardContent className="pt-6">
					<div className="flex items-start gap-3">
						<InfoIcon className="mt-0.5 h-5 w-5 text-blue-600" />
						<div className="text-blue-800 text-sm">
							<h3 className="mb-1 font-medium">Driver Application Process</h3>
							<ul className="list-inside list-disc space-y-1">
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
							<AlertCircleIcon className="mx-auto mb-2 h-8 w-8 text-yellow-600" />
							<p className="text-yellow-800">Loading user information...</p>
							<p className="mt-1 text-sm text-yellow-700">
								Please wait while we load your profile.
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
