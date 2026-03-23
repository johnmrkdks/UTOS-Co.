import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { LogOutIcon, ShieldCheckIcon, UserIcon } from "lucide-react";
import { CustomerNavigation } from "../customer-navigation";
import type { CustomerNavigationItem } from "./types";

interface CustomerMobileMenuContentProps {
	session: any;
	navigationItems: CustomerNavigationItem[];
	onClose: () => void;
	onSignOut: () => void;
}

export function CustomerMobileMenuContent({
	session,
	navigationItems,
	onClose,
	onSignOut,
}: CustomerMobileMenuContentProps) {
	return (
		<>
			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto">
				{/* User Info Section */}
				<div className="border-b p-4">
					<div className="flex items-center space-x-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<UserIcon className="h-6 w-6 text-primary" />
						</div>
						<div className="flex-1">
							<p className="font-medium text-gray-900 text-sm">
								{session?.user.name}
							</p>
							<p className="text-gray-500 text-xs">{session?.user.email}</p>
							<p className="font-medium text-blue-600 text-xs">Customer</p>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<div className="p-4">
					<CustomerNavigation
						navigationItems={navigationItems}
						onNavigate={onClose}
					/>
				</div>

				{/* Account Status */}
				<div className="border-t p-4">
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
								<Badge
									variant="default"
									className="bg-green-100 text-green-700"
								>
									Active
								</Badge>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<ShieldCheckIcon className="h-4 w-4 text-gray-500" />
									<span className="text-sm">Account Status</span>
								</div>
								<Badge variant="default" className="bg-blue-100 text-blue-700">
									Verified
								</Badge>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Fixed Footer with Logout Button */}
			<div className="flex-shrink-0 border-t bg-white p-4">
				<Button
					variant="outline"
					className="flex w-full items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
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
