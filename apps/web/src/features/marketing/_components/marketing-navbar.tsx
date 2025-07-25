import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { MarketingUserMenu } from "@/features/marketing/_components/navbar/marketing-user-menu";
import { MARKETING_ROUTES } from "@/features/marketing/_constants/marketing-routes";

type HeaderProps = {
	className?: string;
};

export function MarketingNavbar({ className, ...props }: HeaderProps) {
	return (
		<div className={cn("bg-beige", className)} {...props}>
			<div className="flex flex-row items-center justify-between p-4">
				<Link to="/" className="flex items-center gap-2 font-medium">
					<Logo />
				</Link>
				<nav className="flex gap-4 text-lg">
					<NavLinks />
				</nav>
				<div className="flex items-center gap-2">
					<MarketingUserMenu />
				</div>
			</div>
			<hr />
		</div>
	);
}

function NavLinks() {
	const links = MARKETING_ROUTES.map(({ path, label }) => {
		return (
			<Link
				key={path}
				to={path}
				activeProps={{ className: "text-primary" }}
				className="text-sm font-semibold"
			>
				{label}
			</Link>
		);
	});

	return <div className="flex items-center gap-4">{links}</div>;
}
