import { Logo } from "@/components/logo";
import { Link } from "@tanstack/react-router";

export function DashboardCompanyLogo() {
	return (
		<div className="flex items-center justify-center gap-2">
			<Link to="/" className="flex items-center font-medium">
				<Logo />
			</Link>
			<div className="flex flex-col items-start justify-center">
				<h1 className="text-sm font-bold truncate">Down Under Chauffeurs</h1>
				<p className="text-xs font-medium text-muted-foreground">KD Prestige</p>
			</div>
		</div>
	);
}
