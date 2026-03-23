import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { SimplifiedDriverOnboardingForm } from "@/features/dashboard/_pages/drivers/_components/simplified-driver-onboarding-form";

export const Route = createFileRoute(
	"/admin/dashboard/_layout/drivers/onboarding",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [mockUserId] = useState("user_mock_123"); // In real app, this would come from auth context

	const handleSuccess = () => {
		navigate({ to: "/admin/dashboard/drivers" });
	};

	const handleBack = () => {
		navigate({ to: "/admin/dashboard/drivers" });
	};

	return (
		<PaddingLayout className="flex-1 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Button variant="outline" size="sm" onClick={handleBack}>
					<ArrowLeftIcon className="h-4 w-4" />
					Back to Driver Management
				</Button>
				<div className="text-right">
					<p className="text-muted-foreground text-sm">
						Need help? Contact support team
					</p>
				</div>
			</div>

			{/* Main Content */}
			<SimplifiedDriverOnboardingForm
				userId={mockUserId}
				onSuccess={handleSuccess}
			/>
		</PaddingLayout>
	);
}
