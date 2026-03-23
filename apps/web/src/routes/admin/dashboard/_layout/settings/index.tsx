import { createFileRoute } from '@tanstack/react-router';
import { SystemSettingsForm } from "@/components/forms/system-settings-form";
import { Settings } from "lucide-react";

export const Route = createFileRoute('/admin/dashboard/_layout/settings/')({
	component: SystemSettingsPage,
});

function SystemSettingsPage() {
	return (
		<div className="space-y-6 p-4">
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-slate-200/50">
					<Settings className="h-5 w-5 text-slate-600" />
				</div>
				<div>
					<h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
					<p className="text-muted-foreground">
						Configure system-wide settings including timezone and booking references.
					</p>
				</div>
			</div>
			<SystemSettingsForm />
		</div>
	);
}
