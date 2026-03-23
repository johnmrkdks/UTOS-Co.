import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import {
	AlertTriangle,
	CalendarIcon,
	MailIcon,
	MoreHorizontal,
	Pencil,
	ShieldIcon,
	Trash2,
	UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useDeleteUserMutation } from "../_hooks/query/use-delete-user-mutation";
import { useGetUsersQuery } from "../_hooks/query/use-get-users-query";
import { EditUserDialog } from "./edit-user-dialog";

interface UsersTableProps {
	role?: "user" | "admin";
	roleFilter?: "clients" | "admins";
}

export function UsersTable({ role, roleFilter }: UsersTableProps) {
	const [editingUser, setEditingUser] = useState<{
		id: string;
		name: string;
		email: string;
		phone?: string | null;
		role: string;
	} | null>(null);
	const [deletingUser, setDeletingUser] = useState<{
		id: string;
		name: string;
		email: string;
		role: string;
	} | null>(null);
	const usersQuery = useGetUsersQuery({ role, roleFilter, limit: 50 });
	const deleteUserMutation = useDeleteUserMutation();

	const handleDelete = async (userId: string) => {
		try {
			await deleteUserMutation.mutateAsync({ userId });
			setDeletingUser(null);
		} catch {
			// Error handled by mutation
		}
	};

	if (usersQuery.isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Users</CardTitle>
					<CardDescription>Loading...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex justify-center py-8">
						<div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (usersQuery.isError) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Users</CardTitle>
					<CardDescription>Error loading users</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-destructive">
						{usersQuery.error?.message || "Failed to load"}
					</p>
				</CardContent>
			</Card>
		);
	}

	const users = usersQuery.data?.users || [];

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{roleFilter === "admins" || role === "admin"
						? "Admin Users"
						: roleFilter === "clients" || role === "user"
							? "Client Users"
							: "All Users"}
				</CardTitle>
				<CardDescription>
					{roleFilter === "admins" || role === "admin"
						? "Admins can manage bookings, drivers, invoices, inbox, and packages."
						: roleFilter === "clients" || role === "user"
							? "Clients can book services and manage their bookings."
							: "All users in the system."}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{users.length === 0 ? (
					<div className="py-8 text-center">
						<UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
						<p className="mt-2 text-muted-foreground text-sm">No users found</p>
					</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="w-[70px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map(
									(user: {
										id: string;
										name: string;
										email: string;
										phone?: string | null;
										role: string;
										emailVerified: boolean;
										createdAt: Date;
									}) => (
										<TableRow key={user.id}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-3">
													{user.image ? (
														<img
															src={user.image}
															alt={user.name}
															className="h-10 w-10 rounded-full"
														/>
													) : (
														<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
															{user.role === "admin" ||
															user.role === "super_admin" ? (
																<ShieldIcon className="h-5 w-5 text-muted-foreground" />
															) : (
																<UserIcon className="h-5 w-5 text-muted-foreground" />
															)}
														</div>
													)}
													<div>
														<p className="font-medium">{user.name}</p>
														<p className="flex items-center gap-1 text-muted-foreground text-sm">
															<MailIcon className="h-3 w-3" />
															{user.email}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className={
														user.role === "super_admin"
															? "border-purple-200 bg-purple-50 text-purple-700"
															: user.role === "admin"
																? "border-blue-200 bg-blue-50 text-blue-700"
																: user.role === "driver"
																	? "border-amber-200 bg-amber-50 text-amber-700"
																	: "border-gray-200 bg-gray-50 text-gray-700"
													}
												>
													{user.role === "super_admin"
														? "Super Admin"
														: user.role === "admin"
															? "Admin"
															: user.role === "driver"
																? "Driver"
																: "Client"}
												</Badge>
											</TableCell>
											<TableCell>
												<span className="text-muted-foreground text-xs">
													{user.emailVerified ? "Verified" : "Unverified"}
												</span>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2 text-muted-foreground text-sm">
													<CalendarIcon className="h-4 w-4" />
													{new Date(user.createdAt).toLocaleDateString()}
												</div>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => setEditingUser(user)}
														>
															<Pencil className="mr-2 h-4 w-4" />
															Edit Credentials
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => setDeletingUser(user)}
															className="text-destructive focus:text-destructive"
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Delete User
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									),
								)}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
			{editingUser && (
				<EditUserDialog
					user={editingUser}
					open={!!editingUser}
					onOpenChange={(open) => !open && setEditingUser(null)}
				/>
			)}
			<AlertDialog
				open={!!deletingUser}
				onOpenChange={(open) => !open && setDeletingUser(null)}
			>
				<AlertDialogContent className="sm:max-w-md">
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-5 w-5" />
							Delete User Account
						</AlertDialogTitle>
						<AlertDialogDescription className="space-y-3 text-left">
							<p className="text-base">
								You are about to{" "}
								<strong className="text-destructive">permanently delete</strong>{" "}
								the account for:
							</p>
							<div className="rounded-lg border bg-muted p-3">
								<p className="font-semibold">
									{deletingUser?.name || "Unknown"}
								</p>
								<p className="text-muted-foreground text-sm">
									{deletingUser?.email}
								</p>
								<p className="mt-1 text-muted-foreground text-xs capitalize">
									{deletingUser?.role}
								</p>
							</div>
							<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
								<p className="font-medium text-destructive text-sm">
									This will permanently:
								</p>
								<ul className="mt-1 ml-2 list-inside list-disc space-y-1 text-destructive/90 text-xs">
									<li>Delete the user account and authentication</li>
									<li>Remove all related data (sessions, profiles, ratings)</li>
									<li>
										Delete their bookings (if client) or unassign from bookings
										(if driver)
									</li>
									<li>This action cannot be undone</li>
								</ul>
							</div>
							<p className="font-medium text-sm">
								Are you sure you want to continue?
							</p>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="gap-3">
						<AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deletingUser && handleDelete(deletingUser.id)}
							className="flex-1 bg-destructive hover:bg-destructive/90"
							disabled={deleteUserMutation.isPending}
						>
							{deleteUserMutation.isPending ? (
								<>
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2" />
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="mr-2 h-4 w-4" />
									Yes, Delete User
								</>
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}
