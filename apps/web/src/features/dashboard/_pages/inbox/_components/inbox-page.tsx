import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Badge } from "@workspace/ui/components/badge";
import { Mail, MailOpen, Archive, RefreshCw } from "lucide-react";
import { useListContactMessagesQuery } from "../../../_hooks/query/use-list-contact-messages-query";
import { ContactMessageCard } from "./contact-message-card";
import { ContactMessageDialog } from "./contact-message-dialog";
import type { ContactMessage } from "server/db/sqlite/schema";

export function InboxPage() {
	const [activeTab, setActiveTab] = useState<"all" | "unread" | "read" | "archived">("all");
	const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const allMessagesQuery = useListContactMessagesQuery();
	const unreadMessagesQuery = useListContactMessagesQuery({ status: "unread" });
	const readMessagesQuery = useListContactMessagesQuery({ status: "read" });
	const archivedMessagesQuery = useListContactMessagesQuery({ status: "archived" });

	const getCurrentQuery = () => {
		switch (activeTab) {
			case "unread":
				return unreadMessagesQuery;
			case "read":
				return readMessagesQuery;
			case "archived":
				return archivedMessagesQuery;
			default:
				return allMessagesQuery;
		}
	};

	const currentQuery = getCurrentQuery();
	const messages = currentQuery.data?.data || [];

	const handleRefresh = () => {
		allMessagesQuery.refetch();
		unreadMessagesQuery.refetch();
		readMessagesQuery.refetch();
		archivedMessagesQuery.refetch();
	};

	const handleOpenMessage = (message: ContactMessage) => {
		setSelectedMessage(message);
		setDialogOpen(true);
	};

	// Count badges
	const unreadCount = unreadMessagesQuery.data?.data?.length || 0;
	const readCount = readMessagesQuery.data?.data?.length || 0;
	const archivedCount = archivedMessagesQuery.data?.data?.length || 0;
	const totalCount = allMessagesQuery.data?.data?.length || 0;

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Inbox</h1>
					<p className="text-muted-foreground">
						Manage customer contact messages and inquiries
					</p>
				</div>
				<Button
					variant="outline"
					onClick={handleRefresh}
					disabled={currentQuery.isLoading}
				>
					<RefreshCw className={`mr-2 h-4 w-4 ${currentQuery.isLoading ? "animate-spin" : ""}`} />
					Refresh
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Contact Messages
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="all" className="flex items-center gap-2">
								All
								{totalCount > 0 && (
									<Badge variant="secondary" className="ml-1">
										{totalCount}
									</Badge>
								)}
							</TabsTrigger>
							<TabsTrigger value="unread" className="flex items-center gap-2">
								<Mail className="h-4 w-4" />
								Unread
								{unreadCount > 0 && (
									<Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
										{unreadCount}
									</Badge>
								)}
							</TabsTrigger>
							<TabsTrigger value="read" className="flex items-center gap-2">
								<MailOpen className="h-4 w-4" />
								Read
								{readCount > 0 && (
									<Badge variant="secondary" className="ml-1">
										{readCount}
									</Badge>
								)}
							</TabsTrigger>
							<TabsTrigger value="archived" className="flex items-center gap-2">
								<Archive className="h-4 w-4" />
								Archived
								{archivedCount > 0 && (
									<Badge variant="secondary" className="ml-1">
										{archivedCount}
									</Badge>
								)}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="all" className="space-y-4 mt-6">
							{currentQuery.isLoading ? (
								<div className="text-center py-8">
									<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
									<p className="text-muted-foreground">Loading messages...</p>
								</div>
							) : messages.length === 0 ? (
								<div className="text-center py-8">
									<Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
									<h3 className="text-lg font-semibold mb-2">No messages found</h3>
									<p className="text-muted-foreground">
										All contact messages will appear here
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{messages.map((message) => (
										<ContactMessageCard
											key={message.id}
											message={message}
											onClick={() => handleOpenMessage(message)}
										/>
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="unread" className="space-y-4 mt-6">
							{unreadMessagesQuery.isLoading ? (
								<div className="text-center py-8">
									<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
									<p className="text-muted-foreground">Loading unread messages...</p>
								</div>
							) : messages.length === 0 ? (
								<div className="text-center py-8">
									<Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
									<h3 className="text-lg font-semibold mb-2">No unread messages</h3>
									<p className="text-muted-foreground">
										New messages from customers will appear here
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{messages.map((message) => (
										<ContactMessageCard
											key={message.id}
											message={message}
											onClick={() => handleOpenMessage(message)}
										/>
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="read" className="space-y-4 mt-6">
							{readMessagesQuery.isLoading ? (
								<div className="text-center py-8">
									<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
									<p className="text-muted-foreground">Loading read messages...</p>
								</div>
							) : messages.length === 0 ? (
								<div className="text-center py-8">
									<MailOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
									<h3 className="text-lg font-semibold mb-2">No read messages</h3>
									<p className="text-muted-foreground">
										Messages you've read will appear here
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{messages.map((message) => (
										<ContactMessageCard
											key={message.id}
											message={message}
											onClick={() => handleOpenMessage(message)}
										/>
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="archived" className="space-y-4 mt-6">
							{archivedMessagesQuery.isLoading ? (
								<div className="text-center py-8">
									<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
									<p className="text-muted-foreground">Loading archived messages...</p>
								</div>
							) : messages.length === 0 ? (
								<div className="text-center py-8">
									<Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
									<h3 className="text-lg font-semibold mb-2">No archived messages</h3>
									<p className="text-muted-foreground">
										Archived messages will appear here
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{messages.map((message) => (
										<ContactMessageCard
											key={message.id}
											message={message}
											onClick={() => handleOpenMessage(message)}
										/>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			<ContactMessageDialog
				message={selectedMessage}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			/>
		</div>
	);
}