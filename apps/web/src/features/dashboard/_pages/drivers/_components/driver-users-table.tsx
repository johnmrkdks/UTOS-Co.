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
	Eye,
	MailIcon,
	MoreHorizontal,
	Trash2,
	UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useDeleteDriverMutation } from "../_hooks/query/use-delete-driver-mutation";
import { useGetUsersQuery } from "../_hooks/query/use-get-users-query";

export function DriverUsersTable() {
	const [deletingUser, setDeletingUser] = useState<any>(null);

	const usersQuery = useGetUsersQuery({ role: "driver" });
	const deleteDriverMutation = useDeleteDriverMutation();

	const handleDelete = async (userId: string) => {
		try {
			console.log("Attempting to delete user:", userId);
			const result = await deleteDriverMutation.mutateAsync({
				userId,
				forceDelete: true,
				confirmationText: "DELETE",
			});
			console.log("Delete result:", result);
			setDeletingUser(null);
		} catch (error) {
			console.error("Failed to delete driver account:", error);
			console.error("Error details:", {
				message: error instanceof Error ? error.message : "Unknown error",
				stack: error instanceof Error ? error.stack : undefined,
				error,
			});
		}
	};

	if (usersQuery.isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Driver Accounts</CardTitle>
					<CardDescription>Loading driver accounts...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex justify-center py-8">
						<div className="h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (usersQuery.isError) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Driver Accounts</CardTitle>
					<CardDescription>Error loading driver accounts</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-destructive">
						{usersQuery.error?.message || "Failed to load driver accounts"}
					</p>
				</CardContent>
			</Card>
		);
	}

	const users = usersQuery.data?.users || [];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Driver User Accounts</CardTitle>
				<CardDescription>
					Manage user accounts with driver role. Drivers must verify their email
					before completing onboarding and can link Google OAuth for easier
					login.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{users.length === 0 ? (
					<div className="py-8 text-center">
						<UserIcon className="mx-auto h-12 w-12 text-gray-400" />
						<p className="mt-2 text-gray-600 text-sm">
							No driver accounts found
						</p>
						<p className="text-gray-500 text-xs">
							Create driver accounts to get started
						</p>
					</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Driver</TableHead>
									{/* <TableHead>Email Status</TableHead> */}
									<TableHead>Account Status</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user: any) => (
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
													<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
														<UserIcon className="h-5 w-5 text-blue-600" />
													</div>
												)}
												<div>
													<p className="font-medium">{user.name}</p>
													<p className="text-gray-500 text-sm">{user.email}</p>
												</div>
											</div>
										</TableCell>
										{/* Hidden Email Status column */}
										{/* <TableCell>
											{user.emailVerified ? (
												<div className="flex items-center gap-2">
													<div className="w-2 h-2 bg-green-500 rounded-full"></div>
													<Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
														<MailIcon className="h-3 w-3 mr-1" />
														Verified
													</Badge>
												</div>
											) : (
												<div className="flex items-center gap-2">
													<div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
													<Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
														<MailIcon className="h-3 w-3 mr-1" />
														Needs Verification
													</Badge>
												</div>
											)}
										</TableCell> */}
										<TableCell>
											<div className="flex flex-col gap-1">
												<Badge
													variant="outline"
													className="w-fit border-blue-200 bg-blue-50 text-blue-700 capitalize"
												>
													{user.role}
												</Badge>
												<span className="text-gray-500 text-xs">
													{user.emailVerified
														? "Can complete onboarding"
														: "Must verify email first"}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2 text-gray-600 text-sm">
												<CalendarIcon className="h-4 w-4" />
												{new Date(user.createdAt).toLocaleDateString()}
											</div>
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem>
														<Eye className="mr-2 h-4 w-4" />
														View Details
													</DropdownMenuItem>
													{!user.emailVerified && (
														<DropdownMenuItem className="text-blue-600">
															<MailIcon className="mr-2 h-4 w-4" />
															Send Verification
														</DropdownMenuItem>
													)}
													<DropdownMenuItem
														onClick={() => setDeletingUser(user)}
														className="text-red-600"
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete Account
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>

			<AlertDialog
				open={!!deletingUser}
				onOpenChange={(open) => !open && setDeletingUser(null)}
			>
				<AlertDialogContent className="sm:max-w-md">
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-red-600">
							<AlertTriangle className="h-5 w-5" />
							⚠️ Delete Driver Account
						</AlertDialogTitle>
						<AlertDialogDescription className="space-y-3 text-left">
							<p className="text-base">
								You are about to{" "}
								<strong className="text-red-600">permanently delete</strong> the
								account for:
							</p>
							<div className="rounded-lg border bg-gray-50 p-3">
								<p className="font-semibold text-gray-900">
									{deletingUser?.name || "Unknown Driver"}
								</p>
								<p className="text-gray-600 text-sm">{deletingUser?.email}</p>
							</div>
							<div className="rounded-lg border border-red-200 bg-red-50 p-3">
								<p className="font-medium text-red-800 text-sm">
									This will permanently:
								</p>
								<ul className="mt-1 ml-2 list-inside list-disc space-y-1 text-red-700 text-xs">
									<li>Delete the user account and authentication</li>
									<li>Remove driver profile and documents</li>
									<li>Cancel any active bookings</li>
									<li>Delete all related data (sessions, profiles, ratings)</li>
									<li>
										<strong>This action CANNOT be undone</strong>
									</li>
								</ul>
							</div>
							<p className="font-medium text-gray-700 text-sm">
								Are you absolutely sure you want to continue?
							</p>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="gap-3">
						<AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deletingUser && handleDelete(deletingUser.id)}
							className="flex-1 bg-red-600 hover:bg-red-700"
							disabled={deleteDriverMutation.isPending}
						>
							{deleteDriverMutation.isPending ? (
								<>
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2" />
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="mr-2 h-4 w-4" />
									Yes, Delete Account
								</>
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}
