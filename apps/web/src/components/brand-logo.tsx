import { Link } from "@tanstack/react-router";
import { BUSINESS_INFO } from "@/constants/business-info";
import { Logo } from "./logo";

export function BrandLogo() {
	return (
		<Link
			to="/"
			className="group inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			<Logo />
			<span className="sr-only">{BUSINESS_INFO.business.name}</span>
		</Link>
	);
}
