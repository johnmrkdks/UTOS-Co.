import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { BUSINESS_INFO } from "@/constants/business-info";
import { Logo } from "./logo";

type BrandLogoProps = {
	className?: string;
	/** Passed through to the mark image (size, max-width, etc.) */
	logoClassName?: string;
	/** Narrow headers / drawers: default to a smaller mark when `logoClassName` is not set */
	compact?: boolean;
};

export function BrandLogo({
	className,
	logoClassName,
	compact = false,
}: BrandLogoProps) {
	return (
		<Link
			to="/"
			aria-label={`${BUSINESS_INFO.business.name} — Home`}
			className={cn(
				"group inline-flex min-w-0 items-center transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className,
			)}
		>
			<Logo
				className={cn(
					"shrink-0",
					!logoClassName &&
						compact &&
						"h-9 max-h-10 max-w-[min(100%,140px)] sm:max-w-[160px]",
					logoClassName,
				)}
			/>
			<span className="sr-only">{BUSINESS_INFO.business.name}</span>
		</Link>
	);
}
