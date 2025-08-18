import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { DriverNavigation } from "../driver-navigation";
import {
	UserIcon,
	ShieldCheckIcon
} from "lucide-react";

interface DriverSidebarProps {
	driverStatus: {
		profileComplete: boolean;
		isApproved: boolean;
		isActive: boolean;
	};
	needsOnboarding: boolean;
}

export function DriverSidebar({ driverStatus, needsOnboarding }: DriverSidebarProps) {
	const navigate = useNavigate();

	return (
		<div className="hidden lg:block w-64 flex-shrink-0">
			<Card>
				<CardHeader className="pb-4">
					<CardTitle className="text-lg">Navigation</CardTitle>
				</CardHeader>
				<CardContent>
					<DriverNavigation />
				</CardContent>
			</Card>

			{/* Account Status Card */}
			<Card className="mt-6">
				<CardHeader className="pb-4">
					<CardTitle className="text-lg">Account Status</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<UserIcon className="h-4 w-4 text-gray-500" />
							<span className="text-sm">Profile</span>
						</div>
						{needsOnboarding ? (
							<Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
								Incomplete
							</Badge>
						) : (
							<Badge variant="default" className="bg-green-100 text-green-700">
								Complete
							</Badge>
						)}
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<ShieldCheckIcon className="h-4 w-4 text-gray-500" />
							<span className="text-sm">Driver Status</span>
						</div>
						{driverStatus.isApproved ? (
							<Badge variant="default" className="bg-green-100 text-green-700">
								Approved
							</Badge>
						) : (
							<Badge variant="secondary" className="bg-gray-100 text-gray-700">
								Pending
							</Badge>
						)}
					</div>

					{needsOnboarding && (
						<div className="pt-2 border-t">
							<Button
								size="sm"
								className="w-full"
								onClick={() => navigate({ to: '/driver/onboarding' })}
							>
								Complete Onboarding
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}