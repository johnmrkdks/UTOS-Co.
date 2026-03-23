import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { ShieldCheckIcon } from "lucide-react";

export function SettingsTab() {
	const navigate = useNavigate();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Settings</CardTitle>
				<CardDescription>Configure your profile preferences</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<Button
						variant="outline"
						onClick={() => navigate({ to: "/driver/settings" })}
						className="w-full sm:w-auto"
					>
						<ShieldCheckIcon className="mr-2 h-4 w-4" />
						Account Security Settings
					</Button>

					<div className="rounded-lg bg-gray-50 p-3">
						<p className="text-gray-600 text-xs">
							Additional profile settings will be available once your driver
							application is approved.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
