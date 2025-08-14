import { ChevronRight, Home } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
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
		<nav className="flex items-center space-x-1 text-sm text-muted-foreground">
			<Home className="size-3.5 mr-2" strokeWidth={3} />
			{breadcrumbs.map((breadcrumb, index) => (
				<Fragment key={breadcrumb.path || breadcrumb.label}>
					{index > 0 && <ChevronRight className="h-4 w-4" />}
					{breadcrumb.path ? (
						<Link
							to={breadcrumb.path}
							className="hover:text-foreground transition-colors font-medium"
						>
							{breadcrumb.label}
						</Link>
					) : (
						<span className="text-foreground font-medium">
							{breadcrumb.label}
						</span>
					)}
				</Fragment>
			))}
		</nav>
	);
}
