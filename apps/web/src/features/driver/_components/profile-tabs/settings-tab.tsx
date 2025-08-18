import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { useNavigate } from '@tanstack/react-router';
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
						onClick={() => navigate({ to: '/driver/settings' })}
						className="w-full sm:w-auto"
					>
						<ShieldCheckIcon className="h-4 w-4 mr-2" />
						Account Security Settings
					</Button>

					<div className="p-3 bg-gray-50 rounded-lg">
						<p className="text-xs text-gray-600">
							Additional profile settings will be available once your driver application is approved.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}