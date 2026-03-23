import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";
import { getBreadcrumbTrail } from "@/constants/routes";

export function Breadcrumbs() {
	const routerState = useRouterState();
	const pathname = routerState.location.pathname;

	const breadcrumbs = getBreadcrumbTrail(pathname);

	// Don't show breadcrumbs on marketing root
	if (pathname === "/" || breadcrumbs.length === 0) {
		return null;
	}

	return (
		<nav className="flex items-center space-x-1 text-muted-foreground text-sm">
			<Home className="mr-2 size-3.5" strokeWidth={3} />
			{breadcrumbs.map((breadcrumb, index) => (
				<Fragment key={breadcrumb.path || breadcrumb.label}>
					{index > 0 && <ChevronRight className="h-4 w-4" />}
					{breadcrumb.path ? (
						<Link
							to={breadcrumb.path}
							className="font-medium transition-colors hover:text-foreground"
						>
							{breadcrumb.label}
						</Link>
					) : (
						<span className="font-medium text-foreground">
							{breadcrumb.label}
						</span>
					)}
				</Fragment>
			))}
		</nav>
	);
}
