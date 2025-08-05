import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { LogOutIcon, UserIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { AuthCTA } from "./auth-cta";

export function MarketingUserMenu() {
	const { session, isPending, handleLogout } = useUserQuery();

	if (isPending) {
		return <Skeleton className="h-9 w-24" />;
	}

	if (!session) {
		return <AuthCTA className="hidden md:flex" />;
	}

	// Check if user has admin privileges
	const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";

	return (
		<div className="flex items-center gap-4">
			{isAdmin && (
				<Button className="rounded-xl shadow-none" asChild>
					<Link to="/dashboard">Dashboard</Link>
				</Button>
			)}

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="rounded-full shadow-none transition-all duration-200 hover:scale-105 hover:shadow-md"
					>
						<UserIcon className="h-5 w-5 transition-transform duration-200" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent 
					className="max-w-64 animate-in slide-in-from-top-2 duration-200" 
					align="end"
				>
					<DropdownMenuLabel className="flex min-w-0 flex-col">
						<span className="text-foreground truncate text-sm font-medium">
							{session.user.name}
						</span>
						<span className="text-muted-foreground truncate text-xs font-normal">
							{session.user.email}
						</span>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem 
						onClick={handleLogout}
						className="cursor-pointer transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
					>
						<LogOutIcon size={16} className="opacity-60 transition-opacity duration-150" aria-hidden="true" />
						<span>Sign Out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
