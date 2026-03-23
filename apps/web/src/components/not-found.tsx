import { Link } from "@tanstack/react-router";

export function NotFound() {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
			<h1 className="font-bold text-6xl text-muted-foreground">404</h1>
			<p className="mt-4 text-center text-lg text-muted-foreground">
				Page not found
			</p>
			<p className="mt-2 max-w-md text-center text-muted-foreground/80 text-sm">
				The page you're looking for doesn't exist or has been moved.
			</p>
			<Link
				to="/"
				className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
			>
				Return to home
			</Link>
		</div>
	);
}
