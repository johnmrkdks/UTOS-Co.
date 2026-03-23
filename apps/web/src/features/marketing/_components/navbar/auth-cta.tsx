import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

type AuthCTAProps = {
	className?: string;
};

export function AuthCTA({ className, ...props }: AuthCTAProps) {
	return (
		<div className={cn("flex items-center gap-2", className)} {...props}>
			<Button variant="outline" size="sm" className="shadow-none" asChild>
				<Link to="/sign-in">Sign In</Link>
			</Button>
			<Button size="sm" className="shadow-none" asChild>
				<Link to="/sign-up">Sign Up</Link>
			</Button>
		</div>
	);
}
