import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { CreateUserDialog } from "./_components/create-user-dialog";
import { UsersTable } from "./_components/users-table";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { UserPlusIcon, UsersIcon, ShieldIcon, UserIcon } from "lucide-react";
import { useGetUsersQuery } from "./_hooks/query/use-get-users-query";

export function UsersManagementPage() {
	const allUsersQuery = useGetUsersQuery({ limit: 100 });
	const totalUsers = allUsersQuery.data?.users?.length || 0;
	const clientCount = allUsersQuery.data?.users?.filter((u: { role: string }) => u.role === "user").length || 0;
	const adminCount = allUsersQuery.data?.users?.filter((u: { role: string }) =>
		u.role === "admin" || u.role === "super_admin"
	).length || 0;

	return (
		<PaddingLayout className="flex-1 space-y-4 mb-8">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">User Management</h2>
				<CreateUserDialog>
					<Button>
						<UserPlusIcon className="h-4 w-4" />
						Add User
					</Button>
				</CreateUserDialog>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<UsersIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalUsers}</div>
						<p className="text-xs text-muted-foreground">All users in the system</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Clients</CardTitle>
						<UserIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{clientCount}</div>
						<p className="text-xs text-muted-foreground">Customer accounts</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Admins</CardTitle>
						<ShieldIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{adminCount}</div>
						<p className="text-xs text-muted-foreground">Admin & Super Admin</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Users</TabsTrigger>
					<TabsTrigger value="clients">Clients</TabsTrigger>
					<TabsTrigger value="admins">Admins</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					<UsersTable />
				</TabsContent>

				<TabsContent value="clients" className="space-y-4">
					<UsersTable role="user" />
				</TabsContent>

				<TabsContent value="admins" className="space-y-4">
					<UsersTable roleFilter="admins" />
				</TabsContent>
			</Tabs>
		</PaddingLayout>
	);
}
