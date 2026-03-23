import { Button } from "@workspace/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import {
	Archive,
	ExternalLink,
	Mail,
	MailOpen,
	MoreHorizontal,
	RefreshCw,
	Send,
	User,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ContactMessage } from "server/db/sqlite/schema";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { useDeleteContactMessageMutation } from "../../../_hooks/query/use-delete-contact-message-mutation";
import { useListContactMessagesQuery } from "../../../_hooks/query/use-list-contact-messages-query";
import { useUpdateContactMessageStatusMutation } from "../../../_hooks/query/use-update-contact-message-status-mutation";

type Contact = {
	email: string;
	name: string;
	messages: ContactMessage[];
	lastMessage: ContactMessage;
	unreadCount: number;
};

function groupMessagesByContact(messages: ContactMessage[]): Contact[] {
	const byEmail = new Map<string, ContactMessage[]>();
	for (const msg of messages) {
		const key = msg.email.toLowerCase().trim();
		if (!byEmail.has(key)) byEmail.set(key, []);
		byEmail.get(key)!.push(msg);
	}
	const contacts: Contact[] = [];
	for (const [email, msgs] of byEmail) {
		const sorted = [...msgs].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
		contacts.push({
			email,
			name: msgs[0]!.name,
			messages: sorted.reverse(),
			lastMessage: sorted[sorted.length - 1]!,
			unreadCount: msgs.filter((m) => m.status === "unread").length,
		});
	}
	contacts.sort(
		(a, b) =>
			new Date(b.lastMessage.createdAt).getTime() -
			new Date(a.lastMessage.createdAt).getTime(),
	);
	return contacts;
}

function filterContactsByTab(contacts: Contact[], tab: string): Contact[] {
	switch (tab) {
		case "unread":
			return contacts.filter((c) => c.unreadCount > 0);
		case "read":
			return contacts.filter(
				(c) =>
					c.unreadCount === 0 && c.messages.some((m) => m.status === "read"),
			);
		case "archived":
			return contacts.filter((c) =>
				c.messages.every((m) => m.status === "archived"),
			);
		default:
			return contacts;
	}
}

export function InboxPage() {
	const [activeTab, setActiveTab] = useState<
		"all" | "unread" | "read" | "archived"
	>("all");
	const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(
		null,
	);

	const allQuery = useListContactMessagesQuery();
	const unreadQuery = useListContactMessagesQuery({ status: "unread" });
	const readQuery = useListContactMessagesQuery({ status: "read" });
	const archivedQuery = useListContactMessagesQuery({ status: "archived" });

	const updateStatusMutation = useUpdateContactMessageStatusMutation({
		silent: true,
	});
	const deleteMutation = useDeleteContactMessageMutation();

	const allMessages = allQuery.data?.data ?? [];
	const contacts = useMemo(
		() => groupMessagesByContact(allMessages),
		[allMessages],
	);
	const selectedContact = selectedEmail
		? (contacts.find(
				(c) => c.email.toLowerCase() === selectedEmail.toLowerCase(),
			) ?? null)
		: null;
	const filteredContacts = useMemo(
		() => filterContactsByTab(contacts, activeTab),
		[contacts, activeTab],
	);

	const unreadCount = unreadQuery.data?.data?.length ?? 0;
	const readCount = readQuery.data?.data?.length ?? 0;
	const archivedCount = archivedQuery.data?.data?.length ?? 0;

	const handleRefresh = () => {
		allQuery.refetch();
		unreadQuery.refetch();
		readQuery.refetch();
		archivedQuery.refetch();
	};

	const handleSelectContact = (contact: Contact) => {
		setSelectedEmail(contact.email);
		// Mark first unread as read when opening
		const firstUnread = contact.messages.find((m) => m.status === "unread");
		if (firstUnread) {
			updateStatusMutation.mutate({
				messageId: firstUnread.id,
				status: "read",
			});
		}
	};

	const handleMarkAsRead = (msg: ContactMessage) => {
		if (msg.status !== "read") {
			updateStatusMutation.mutate({ messageId: msg.id, status: "read" });
		}
	};

	const handleMarkAsUnread = (msg: ContactMessage) => {
		if (msg.status !== "unread") {
			updateStatusMutation.mutate({ messageId: msg.id, status: "unread" });
		}
	};

	const handleArchive = (msg: ContactMessage) => {
		if (msg.status !== "archived") {
			updateStatusMutation.mutate({ messageId: msg.id, status: "archived" });
		}
	};

	const handleDeleteClick = (msg: ContactMessage) => {
		setMessageToDelete(msg);
		setShowDeleteDialog(true);
	};

	const handleConfirmDelete = () => {
		if (!messageToDelete) return;
		deleteMutation.mutate(
			{ messageId: messageToDelete.id },
			{
				onSuccess: () => {
					setShowDeleteDialog(false);
					setMessageToDelete(null);
					if (selectedContact && selectedContact.messages.length === 1) {
						setSelectedEmail(null);
					}
					handleRefresh();
				},
			},
		);
	};

	const handleReply = () => {
		if (!selectedContact) return;
		const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedContact.email)}&su=${encodeURIComponent(`Re: Contact Form Message from ${selectedContact.name}`)}`;
		window.open(url, "_blank");
	};

	const isLoading = allQuery.isLoading;

	return (
		<>
			<div className="flex h-[calc(100vh-var(--navbar-height,60px))] overflow-hidden rounded-md border border-border/60 bg-background">
				{/* Left: Contact list */}
				<div className="flex w-80 flex-shrink-0 flex-col border-border/60 border-r bg-muted/20">
					<div className="border-border/60 border-b bg-background p-4">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100">
									<Mail className="h-4 w-4 text-blue-600" />
								</div>
								<h1 className="font-medium text-foreground text-lg">Inbox</h1>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleRefresh}
								disabled={isLoading}
								className="h-8 w-8 rounded-md"
							>
								<RefreshCw
									className={cn(
										"h-4 w-4 text-muted-foreground",
										isLoading && "animate-spin",
									)}
								/>
							</Button>
						</div>
						<Tabs
							value={activeTab}
							onValueChange={(v) => setActiveTab(v as typeof activeTab)}
						>
							<TabsList className="grid h-8 w-full grid-cols-4 rounded-md bg-muted/50">
								<TabsTrigger value="all" className="rounded-md px-2 text-xs">
									All
								</TabsTrigger>
								<TabsTrigger
									value="unread"
									className="flex items-center gap-1 rounded-md px-2 text-xs"
								>
									Unread
									{unreadCount > 0 && (
										<span className="flex h-4 min-w-4 items-center justify-center rounded-sm bg-muted-foreground/20 px-1 text-[10px] text-muted-foreground">
											{unreadCount}
										</span>
									)}
								</TabsTrigger>
								<TabsTrigger value="read" className="rounded-md px-2 text-xs">
									Read
								</TabsTrigger>
								<TabsTrigger
									value="archived"
									className="rounded-md px-2 text-xs"
								>
									Arch
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					<div className="flex-1 overflow-y-auto">
						{isLoading ? (
							<div className="flex flex-col items-center justify-center py-12">
								<RefreshCw className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
								<p className="text-muted-foreground text-sm">Loading...</p>
							</div>
						) : filteredContacts.length === 0 ? (
							<div className="flex flex-col items-center justify-center px-4 py-12">
								<Mail className="mb-3 h-12 w-12 text-muted-foreground/60" />
								<p className="text-center text-muted-foreground text-sm">
									No {activeTab !== "all" ? activeTab : ""} messages
								</p>
							</div>
						) : (
							<div className="divide-y divide-border/40">
								{filteredContacts.map((contact) => (
									<button
										key={contact.email}
										type="button"
										onClick={() => handleSelectContact(contact)}
										className={cn(
											"flex w-full items-start gap-3 rounded-none p-3 text-left transition-colors hover:bg-muted/40",
											selectedContact?.email === contact.email && "bg-muted/50",
										)}
									>
										<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-muted">
											<User className="h-4 w-4 text-muted-foreground" />
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-center justify-between gap-2">
												<span className="truncate font-medium text-foreground text-sm">
													{contact.name}
												</span>
												<span className="flex-shrink-0 text-muted-foreground text-xs">
													{format(
														new Date(contact.lastMessage.createdAt),
														"MMM d",
													)}
												</span>
											</div>
											<p className="mt-0.5 truncate text-muted-foreground text-sm">
												{contact.lastMessage.message.slice(0, 50)}
												{contact.lastMessage.message.length > 50 ? "…" : ""}
											</p>
											{contact.unreadCount > 0 && (
												<span className="mt-1 inline-flex h-4 min-w-4 items-center justify-center rounded-sm bg-muted-foreground/15 px-1 text-[10px] text-muted-foreground">
													{contact.unreadCount}
												</span>
											)}
										</div>
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Right: Message thread */}
				<div className="flex min-w-0 flex-1 flex-col bg-background">
					{selectedContact ? (
						<>
							{/* Header - minimal */}
							<div className="flex items-center gap-3 border-border/60 border-b bg-background p-4">
								<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-muted">
									<User className="h-4 w-4 text-muted-foreground" />
								</div>
								<div className="min-w-0 flex-1">
									<h2 className="truncate font-medium text-foreground text-sm">
										{selectedContact.name}
									</h2>
									<a
										href={`mailto:${selectedContact.email}`}
										className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
										onClick={(e) => {
											e.preventDefault();
											handleReply();
										}}
									>
										{selectedContact.email}
										<ExternalLink className="h-3 w-3" />
									</a>
								</div>
							</div>

							{/* Messages - min-h-0 allows flex child to shrink and scroll */}
							<div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
								{selectedContact.messages.map((msg) => (
									<div key={msg.id} className="flex justify-start">
										<div className="flex max-w-[75%] gap-2">
											<div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-muted">
												<User className="h-3.5 w-3.5 text-muted-foreground" />
											</div>
											<div className="flex flex-col">
												<div className="rounded-md rounded-tl-sm bg-muted/70 px-3 py-2">
													<p className="whitespace-pre-wrap text-foreground text-sm">
														{msg.message}
													</p>
												</div>
												<div className="mt-1 flex items-center gap-2">
													<span className="text-muted-foreground text-xs">
														{format(
															new Date(msg.createdAt),
															"MMM d, yyyy 'at' h:mm a",
														)}
													</span>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																className="h-6 w-6 rounded-md p-0 text-muted-foreground hover:text-foreground"
															>
																<MoreHorizontal className="h-3 w-3" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent
															align="start"
															className="rounded-md"
														>
															{msg.status !== "read" && (
																<DropdownMenuItem
																	onClick={() => handleMarkAsRead(msg)}
																>
																	<MailOpen className="mr-2 h-4 w-4" />
																	Mark as Read
																</DropdownMenuItem>
															)}
															{msg.status !== "unread" && (
																<DropdownMenuItem
																	onClick={() => handleMarkAsUnread(msg)}
																>
																	<Mail className="mr-2 h-4 w-4" />
																	Mark as Unread
																</DropdownMenuItem>
															)}
															{msg.status !== "archived" && (
																<DropdownMenuItem
																	onClick={() => handleArchive(msg)}
																>
																	<Archive className="mr-2 h-4 w-4" />
																	Archive
																</DropdownMenuItem>
															)}
															<DropdownMenuItem
																onClick={() => handleDeleteClick(msg)}
																className="text-destructive focus:text-destructive"
															>
																Delete
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Footer - Reply via Gmail at bottom, flush with no gap */}
							<div className="flex-shrink-0 px-4 pt-4">
								<Button
									size="sm"
									onClick={handleReply}
									className="h-9 w-full justify-center rounded-lg"
								>
									<Send className="mr-2 h-3.5 w-3.5" />
									Reply via Gmail
								</Button>
							</div>
						</>
					) : (
						<div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
							<Mail className="mb-4 h-16 w-16 opacity-40" />
							<p className="font-medium text-base">Select a conversation</p>
							<p className="mt-1 text-sm">
								Choose a contact from the list to view their messages
							</p>
						</div>
					)}
				</div>
			</div>

			<DeleteConfirmationDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				onConfirm={handleConfirmDelete}
				title="Delete Message"
				itemName={
					messageToDelete ? `message from ${messageToDelete.name}` : "message"
				}
				description="Are you sure you want to delete this message? This cannot be undone."
				isLoading={deleteMutation.isPending}
			/>
		</>
	);
}
