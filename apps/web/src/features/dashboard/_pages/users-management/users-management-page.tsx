import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { AnalyticsCard, type AnalyticsCardData } from "@/components/analytics-card";
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

	const userStatsData: AnalyticsCardData[] = [
		{
			id: 'total',
			title: 'Total Users',
			value: totalUsers,
			icon: UsersIcon,
			bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
			iconBg: 'bg-blue-500',
			changeText: 'All users in the system',
			changeType: 'neutral',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'clients',
			title: 'Clients',
			value: clientCount,
			icon: UserIcon,
			bgGradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
			iconBg: 'bg-emerald-500',
			changeText: 'Customer accounts',
			changeType: 'neutral',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'admins',
			title: 'Admins',
			value: adminCount,
			icon: ShieldIcon,
			bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
			iconBg: 'bg-purple-500',
			changeText: 'Admin & Super Admin',
			changeType: 'neutral',
			showIcon: true,
			showBackgroundIcon: true
		}
	];

	return (
		<PaddingLayout className="flex-1 space-y-4 mb-8">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center border border-purple-200/50">
						<UsersIcon className="h-5 w-5 text-purple-600" />
					</div>
					<div>
						<h2 className="text-2xl font-bold tracking-tight">User Management</h2>
						<p className="text-sm text-muted-foreground">Manage users and roles</p>
					</div>
				</div>
				<CreateUserDialog>
					<Button>
						<UserPlusIcon className="h-4 w-4" />
						Add User
					</Button>
				</CreateUserDialog>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{userStatsData.map((data) => (
					<AnalyticsCard
						key={data.id}
						data={data}
						view="compact"
						className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
					/>
				))}
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
