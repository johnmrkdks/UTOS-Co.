import { Link } from "@tanstack/react-router";

import { UserMenu } from "./user-menu";
import logo from "@/assets/logo.webp";
import { cn } from "@/lib/utils";
import { MARKETING_ROUTES } from "@/features/marketing/marketing-routes";

type HeaderProps = {
	className?: string;
};

export default function Header({ className, ...props }: HeaderProps) {
	return (
		<div className={cn("bg-secondary-background", className)} {...props}>
			<div className="flex flex-row items-center justify-between p-4">
				<div>
					<img src={logo} alt="logo" className="h-12 w-20 rounded-xl" />
				</div>
				<nav className="flex gap-4 text-lg">
					<NavLinks />
				</nav>
				<div className="flex items-center gap-2">
					<UserMenu />
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
