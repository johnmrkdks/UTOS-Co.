import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useUserQuery } from '@/hooks/query/use-user-query';
import { SecurityTab } from '@/features/driver/_components/settings-tabs/security-tab';
import { AccountTab } from '@/features/driver/_components/settings-tabs/account-tab';
import { NotificationsTab } from '@/features/driver/_components/settings-tabs/notifications-tab';
import {
	ArrowLeftIcon
} from "lucide-react";


export const Route = createFileRoute('/driver/_layout/settings')({
	component: DriverSettingsComponent,
});


function DriverSettingsComponent() {
	const navigate = useNavigate();
	const { session } = useUserQuery();

	const user = session?.user;


	const handleBack = () => {
		navigate({ to: '/driver' });
	};

	return (
		<div className="max-w-4xl mx-auto space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Button variant="outline" size="sm" onClick={handleBack} className="hidden md:flex">
					<ArrowLeftIcon className="h-4 w-4" />
					Back to Dashboard
				</Button>
				<div className="flex-1 md:flex-none">
					<h1 className="text-xl font-bold">Account Settings</h1>
					<p className="text-gray-600 text-sm">Manage your account security and preferences</p>
				</div>
			</div>

			<Tabs defaultValue="security" className="space-y-4">
				<TabsList className="grid w-full grid-cols-2 h-auto">
					<TabsTrigger value="security" className="text-xs py-2">Security</TabsTrigger>
					<TabsTrigger value="account" className="text-xs py-2">Account</TabsTrigger>
					{/* Hidden tab for now */}
					{/* <TabsTrigger value="notifications" className="text-xs py-2">Notifications</TabsTrigger> */}
				</TabsList>

				{/* Security Tab */}
				<TabsContent value="security" className="space-y-4">
					<SecurityTab user={user} />
				</TabsContent>

				{/* Account Tab */}
				<TabsContent value="account" className="space-y-4">
					<AccountTab user={user} />
				</TabsContent>

				{/* Hidden tab content for now */}
				{/* <TabsContent value="notifications" className="space-y-4">
					<NotificationsTab />
				</TabsContent> */}
			</Tabs>
		</div>
	);
}
