import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { DriverNavigation } from "../driver-navigation";
import {
	LogOutIcon,
	UserIcon,
	ShieldCheckIcon
} from "lucide-react";

interface DriverMobileMenuContentProps {
	session: any;
	driverStatus: {
		profileComplete: boolean;
		isApproved: boolean;
		isActive: boolean;
	};
	needsOnboarding: boolean;
	onClose: () => void;
	onSignOut: () => void;
}

export function DriverMobileMenuContent({
	session,
	driverStatus,
	needsOnboarding,
	onClose,
	onSignOut
}: DriverMobileMenuContentProps) {
	const navigate = useNavigate();

	return (
		<>
			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto">
				{/* User Info Section */}
				<div className="p-4 border-b">
					<div className="flex items-center space-x-3">
						<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
							<UserIcon className="h-6 w-6 text-primary" />
						</div>
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-900">{session?.user.name}</p>
							<p className="text-xs text-gray-500">{session?.user.email}</p>
							<p className="text-xs text-blue-600 font-medium">Driver</p>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<div className="p-4">
					<DriverNavigation 
						onNavigate={onClose} 
						driverStatus={driverStatus}
						needsOnboarding={needsOnboarding}
					/>
				</div>

				{/* Account Status */}
				<div className="p-4 border-t">
					<Card>
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
										onClick={() => {
											navigate({ to: '/driver/onboarding' });
											onClose();
										}}
									>
										Complete Onboarding
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Fixed Footer with Logout Button */}
			<div className="p-4 border-t flex-shrink-0 bg-white">
				<Button
					variant="outline"
					className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
					onClick={() => {
						onClose();
						onSignOut();
					}}
				>
					<LogOutIcon className="h-4 w-4" />
					<span>Sign Out</span>
				</Button>
			</div>
		</>
	);
}