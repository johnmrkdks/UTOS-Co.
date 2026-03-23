import { createFileRoute } from '@tanstack/react-router';
import { AccountLinkingForm } from "@/components/forms/account-linking-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { useUserQuery } from "@/hooks/query/use-user-query";
import {
	CheckCircleIcon,
	AlertCircleIcon,
	UserIcon
} from "lucide-react";

export const Route = createFileRoute('/admin/dashboard/_layout/settings/account')({
	component: AccountSettingsPage,
});

function AccountSettingsPage() {
	const { session } = useUserQuery();

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Account</h2>
				<p className="text-muted-foreground">
					Manage your account information and linked authentication methods.
				</p>
			</div>

			{/* Account Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<UserIcon className="h-5 w-5" />
						Account Information
					</CardTitle>
					<CardDescription>
						Your administrator account details
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<span className="text-sm font-medium text-gray-500">Email</span>
						<p className="font-medium">{session?.user.email}</p>
					</div>

					<div className="space-y-2">
						<span className="text-sm font-medium text-gray-500">Role</span>
						<Badge variant="default" className="bg-purple-100 text-purple-700 capitalize">
							{session?.user.role || "Admin"}
						</Badge>
					</div>

					<div className="space-y-2">
						<span className="text-sm font-medium text-gray-500">Email Status</span>
						<div className="flex items-center gap-2">
							{session?.user.emailVerified ? (
								<>
									<CheckCircleIcon className="h-4 w-4 text-green-600" />
									<span className="text-sm text-green-600">Verified</span>
								</>
							) : (
								<>
									<AlertCircleIcon className="h-4 w-4 text-orange-600" />
									<span className="text-sm text-orange-600">Not verified</span>
								</>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<span className="text-sm font-medium text-gray-500">Member Since</span>
						<p className="font-medium">
							{session?.user.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : "Unknown"}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Account Linking */}
			<AccountLinkingForm
				title="Linked Accounts"
				description="Manage your admin sign-in methods and account security"
				userEmail={session?.user?.email}
			/>
		</div>
	);
}
