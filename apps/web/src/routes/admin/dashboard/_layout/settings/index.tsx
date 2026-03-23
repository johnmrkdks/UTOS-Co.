import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { SystemSettingsForm } from "@/components/forms/system-settings-form";

export const Route = createFileRoute("/admin/dashboard/_layout/settings/")({
	component: SystemSettingsPage,
});

function SystemSettingsPage() {
	return (
		<div className="space-y-6 p-4">
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100">
					<Settings className="h-5 w-5 text-slate-600" />
				</div>
				<div>
					<h2 className="font-bold text-2xl tracking-tight">System Settings</h2>
					<p className="text-muted-foreground">
						Configure system-wide settings including timezone and booking
						references.
					</p>
				</div>
			</div>
			<SystemSettingsForm />
		</div>
	);
}
