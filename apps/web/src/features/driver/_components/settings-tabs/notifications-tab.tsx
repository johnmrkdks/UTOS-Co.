import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

export function NotificationsTab() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Notification Preferences</CardTitle>
				<CardDescription>
					Control how you receive updates and alerts
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<p className="text-sm text-gray-600">
						Notification settings will be available once your driver profile is complete and approved.
					</p>
					<Button variant="outline" disabled size="sm" className="w-full sm:w-auto">
						Configure Notifications
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}