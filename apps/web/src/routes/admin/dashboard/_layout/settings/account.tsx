import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { AlertCircleIcon, CheckCircleIcon, UserIcon } from "lucide-react";
import { AccountLinkingForm } from "@/components/forms/account-linking-form";
import { useUserQuery } from "@/hooks/query/use-user-query";

export const Route = createFileRoute(
	"/admin/dashboard/_layout/settings/account",
)({
	component: AccountSettingsPage,
});

function AccountSettingsPage() {
	const { session } = useUserQuery();

	return (
		<div className="space-y-6">
			<div>
				<h2 className="font-bold text-2xl tracking-tight">Account</h2>
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
					<CardDescription>Your administrator account details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<span className="font-medium text-gray-500 text-sm">Email</span>
						<p className="font-medium">{session?.user.email}</p>
					</div>

					<div className="space-y-2">
						<span className="font-medium text-gray-500 text-sm">Role</span>
						<Badge
							variant="default"
							className="bg-purple-100 text-purple-700 capitalize"
						>
							{session?.user.role || "Admin"}
						</Badge>
					</div>

					<div className="space-y-2">
						<span className="font-medium text-gray-500 text-sm">
							Email Status
						</span>
						<div className="flex items-center gap-2">
							{session?.user.emailVerified ? (
								<>
									<CheckCircleIcon className="h-4 w-4 text-green-600" />
									<span className="text-green-600 text-sm">Verified</span>
								</>
							) : (
								<>
									<AlertCircleIcon className="h-4 w-4 text-orange-600" />
									<span className="text-orange-600 text-sm">Not verified</span>
								</>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<span className="font-medium text-gray-500 text-sm">
							Member Since
						</span>
						<p className="font-medium">
							{session?.user.createdAt
								? new Date(session.user.createdAt).toLocaleDateString()
								: "Unknown"}
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
