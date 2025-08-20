import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";
import { BUSINESS_INFO } from "@/constants/business-info";

export function BrandLogo() {
	return (
		<Link to="/" className="flex items-center gap-3 group">
			<Logo />
			<div className="hidden sm:block">
				<h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
					{BUSINESS_INFO.business.name}
				</h1>
				<p className="text-xs text-muted-foreground -mt-1">
					{BUSINESS_INFO.business.slogan}
				</p>
			</div>
		</Link>

	)
}
