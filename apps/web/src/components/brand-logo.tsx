import { Link } from "@tanstack/react-router";
import { BUSINESS_INFO } from "@/constants/business-info";
import { Logo } from "./logo";

export function BrandLogo() {
	return (
		<Link to="/" className="group flex items-center gap-3">
			<Logo />
			<div className="hidden sm:block">
				<h1 className="font-bold text-foreground text-xl transition-colors group-hover:text-primary">
					{BUSINESS_INFO.business.name}
				</h1>
				<p className="-mt-1 text-muted-foreground text-xs">
					{BUSINESS_INFO.business.slogan}
				</p>
			</div>
		</Link>
	);
}
