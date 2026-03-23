import { Button } from "@workspace/ui/components/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import { ShieldIcon, UserIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import {
	AnalyticsCard,
	type AnalyticsCardData,
} from "@/components/analytics-card";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { CreateUserDialog } from "./_components/create-user-dialog";
import { UsersTable } from "./_components/users-table";
import { useGetUsersQuery } from "./_hooks/query/use-get-users-query";

export function UsersManagementPage() {
	const allUsersQuery = useGetUsersQuery({ limit: 100 });
	const totalUsers = allUsersQuery.data?.users?.length || 0;
	const clientCount =
		allUsersQuery.data?.users?.filter(
			(u: { role: string }) => u.role === "user",
		).length || 0;
	const adminCount =
		allUsersQuery.data?.users?.filter(
			(u: { role: string }) => u.role === "admin" || u.role === "super_admin",
		).length || 0;

	const userStatsData: AnalyticsCardData[] = [
		{
			id: "total",
			title: "Total Users",
			value: totalUsers,
			icon: UsersIcon,
			bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
			iconBg: "bg-blue-500",
			changeText: "All users in the system",
			changeType: "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "clients",
			title: "Clients",
			value: clientCount,
			icon: UserIcon,
			bgGradient: "bg-gradient-to-br from-emerald-50 to-emerald-100",
			iconBg: "bg-emerald-500",
			changeText: "Customer accounts",
			changeType: "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "admins",
			title: "Admins",
			value: adminCount,
			icon: ShieldIcon,
			bgGradient: "bg-gradient-to-br from-purple-50 to-purple-100",
			iconBg: "bg-purple-500",
			changeText: "Admin & Super Admin",
			changeType: "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
	];

	return (
		<PaddingLayout className="mb-8 flex-1 space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100">
						<UsersIcon className="h-5 w-5 text-purple-600" />
					</div>
					<div>
						<h2 className="font-bold text-2xl tracking-tight">
							User Management
						</h2>
						<p className="text-muted-foreground text-sm">
							Manage users and roles
						</p>
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
						className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
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
