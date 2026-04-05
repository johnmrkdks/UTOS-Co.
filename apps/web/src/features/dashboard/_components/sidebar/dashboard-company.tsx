import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

export function DashboardCompanyLogo() {
	return (
		<Link
			to="/"
			className="flex items-center justify-center rounded-lg px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
		>
			<Logo className="h-12 max-h-14 w-auto max-w-[min(100%,200px)] object-contain object-left md:h-14" />
			<span className="sr-only">UTOS & Co. Australia — home</span>
		</Link>
	);
}
