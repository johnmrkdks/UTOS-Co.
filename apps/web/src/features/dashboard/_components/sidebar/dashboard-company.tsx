import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

export function DashboardCompanyLogo() {
	return (
		<div className="flex items-center justify-center gap-2">
			<Link to="/" className="flex items-center font-medium">
				<Logo />
			</Link>
			<div className="flex flex-col items-start justify-center">
				<h1 className="truncate font-bold text-sm">Down Under Chauffeurs</h1>
				<p className="font-medium text-muted-foreground text-xs">KD Prestige</p>
			</div>
		</div>
	);
}
