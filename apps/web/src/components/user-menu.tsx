import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOutIcon, UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export function UserMenu() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="h-9 w-24" />;
	}

	if (!session) {
		return (
			<>
				<Button size="lg" className="rounded-xl shadow-none" asChild>
					<Link to="/sign-up">Sign Up</Link>
				</Button>
				<Button
					variant="secondary"
					size="lg"
					className="rounded-xl shadow-none bg-background"
					asChild
				>
					<Link to="/sign-in">Sign In</Link>
				</Button>
			</>
		);
	}

	function handleLogout() {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({
						to: "/",
					});
				},
			},
		});
	}

	return (
		<div className="flex items-center gap-4">
			{(session && session.user.role === "admin") ||
				(session.user.role === "super_admin" && (
					<Button className="rounded-xl shadow-none" asChild>
						<Link to="/dashboard">Dashboard</Link>
					</Button>
				))}

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="rounded-full shadow-none"
					>
						<UserIcon className="h-5 w-5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="max-w-64" align="end">
					<DropdownMenuLabel className="flex min-w-0 flex-col">
						<span className="text-foreground truncate text-sm font-medium">
							{session?.user.name}
						</span>
						<span className="text-muted-foreground truncate text-xs font-normal">
							{session?.user.email}
						</span>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleLogout}>
						<LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
						<span>Sign Out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
