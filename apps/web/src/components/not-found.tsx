import { Link } from "@tanstack/react-router";

export function NotFound() {
	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
			<h1 className="text-6xl font-bold text-muted-foreground">404</h1>
			<p className="mt-4 text-lg text-muted-foreground text-center">
				Page not found
			</p>
			<p className="mt-2 text-sm text-muted-foreground/80 text-center max-w-md">
				The page you're looking for doesn't exist or has been moved.
			</p>
			<Link
				to="/"
				className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
			>
				Return to home
			</Link>
		</div>
	);
}
