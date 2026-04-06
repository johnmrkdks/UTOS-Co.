import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { BUSINESS_INFO } from "@/constants/business-info";

export function DashboardCompanyLogo() {
	return (
		<Link
			to="/"
			aria-label={`${BUSINESS_INFO.business.name} — Home`}
			className="flex min-w-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
		>
			<Logo className="h-9 w-auto max-w-[100px] shrink-0 object-contain object-left md:h-10 md:max-w-[120px]" />
			<span className="min-w-0 truncate font-semibold font-serif text-sidebar-foreground text-sm leading-snug tracking-tight md:text-base">
				{BUSINESS_INFO.business.name}
			</span>
		</Link>
	);
}
