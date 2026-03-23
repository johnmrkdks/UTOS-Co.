import { createFileRoute } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { ShieldIcon } from "lucide-react";
import { UpdatePasswordForm } from "@/components/forms/update-password-form";

export const Route = createFileRoute(
	"/admin/dashboard/_layout/settings/security",
)({
	component: SecuritySettingsPage,
});

function SecuritySettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="font-bold text-2xl tracking-tight">Security</h2>
				<p className="text-muted-foreground">
					Manage your password and security preferences.
				</p>
			</div>

			<UpdatePasswordForm
				title="Password"
				description="Update your administrator password. This will sign you out of all other devices for security."
			/>

			{/* Security Notice */}
			<Card className="border-amber-200 bg-amber-50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-amber-800 text-base">
						<ShieldIcon className="h-4 w-4" />
						Security Notice
					</CardTitle>
				</CardHeader>
				<CardContent className="text-amber-700 text-sm">
					<p>
						As an administrator, you have access to sensitive system data.
						Always use a strong, unique password and keep your account secure.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
