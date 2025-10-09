import { createFileRoute } from '@tanstack/react-router';
import { SystemSettingsForm } from "@/components/forms/system-settings-form";

export const Route = createFileRoute('/admin/dashboard/_layout/settings/')({
	component: SystemSettingsPage,
});

function SystemSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
				<p className="text-muted-foreground">
					Configure system-wide settings including timezone and booking references.
				</p>
			</div>
			<SystemSettingsForm />
		</div>
	);
}
