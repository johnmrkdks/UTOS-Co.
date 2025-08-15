import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { DriverOnboardingForm } from "@/features/dashboard/_pages/drivers/_components/driver-onboarding-form";
import { ArrowLeftIcon } from "lucide-react";
import { PaddingLayout } from '@/features/dashboard/_layouts/padding-layout';
import { useState } from "react";

export const Route = createFileRoute('/dashboard/_layout/drivers/onboarding')({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [mockUserId] = useState("user_mock_123"); // In real app, this would come from auth context

	const handleSuccess = () => {
		navigate({ to: '/dashboard/drivers' });
	};

	const handleBack = () => {
		navigate({ to: '/dashboard/drivers' });
	};

	return (
		<PaddingLayout className="flex-1 space-y-6">
			{/* Header */}
			<div className="flex items-center space-x-4">
				<Button variant="outline" size="sm" onClick={handleBack}>
					<ArrowLeftIcon className="h-4 w-4" />
					Back to Drivers
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Driver Onboarding</h1>
					<p className="text-muted-foreground">
						Complete the driver application process with personal information and required documents.
					</p>
				</div>
			</div>

			{/* Main Content */}
			<Card>
				<CardHeader className="pb-6">
					<CardTitle>New Driver Application</CardTitle>
					<CardDescription>
						Please fill out all sections and upload the required documents to complete your driver application.
						All information will be reviewed by our admin team.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DriverOnboardingForm
						userId={mockUserId}
						onSuccess={handleSuccess}
					/>
				</CardContent>
			</Card>
		</PaddingLayout>
	);
}
