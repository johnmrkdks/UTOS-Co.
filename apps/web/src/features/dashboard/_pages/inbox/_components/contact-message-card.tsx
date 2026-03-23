import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { format } from "date-fns";
import { Mail, MailOpen, Archive, MoreHorizontal, ExternalLink, Trash2 } from "lucide-react";
import type { ContactMessage } from "server/db/sqlite/schema";
import { useUpdateContactMessageStatusMutation } from "../../../_hooks/query/use-update-contact-message-status-mutation";
import { useDeleteContactMessageMutation } from "../../../_hooks/query/use-delete-contact-message-mutation";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { useState } from "react";

interface ContactMessageCardProps {
	message: ContactMessage;
	onClick: () => void;
}

export function ContactMessageCard({ message, onClick }: ContactMessageCardProps) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const updateStatusMutation = useUpdateContactMessageStatusMutation();
	const silentUpdateStatusMutation = useUpdateContactMessageStatusMutation({ silent: true });
	const deleteMessageMutation = useDeleteContactMessageMutation();

	const handleStatusChange = (status: "unread" | "read" | "archived") => {
		updateStatusMutation.mutate({
			messageId: message.id,
			status,
		});
	};

	const handleEmailClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent card click
		const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(message.email)}&su=${encodeURIComponent(`Re: Contact Form Message from ${message.name}`)}`;
		window.open(gmailUrl, '_blank');
	};

	const handleCardClick = () => {
		// Mark as read when opening (silently)
		if (message.status === "unread") {
			silentUpdateStatusMutation.mutate({
				messageId: message.id,
				status: "read",
			});
		}
		onClick();
	};

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowDeleteDialog(true);
	};

	const handleConfirmDelete = () => {
		deleteMessageMutation.mutate({
			messageId: message.id,
		}, {
			onSuccess: () => {
				setShowDeleteDialog(false);
			},
		});
	};

	const getStatusBadge = () => {
		switch (message.status) {
			case "unread":
				return (
					<Badge variant="secondary" className="bg-blue-100 text-blue-800">
						<Mail className="mr-1 h-3 w-3" />
						Unread
					</Badge>
				);
			case "read":
				return (
					<Badge variant="secondary" className="bg-green-100 text-green-800">
						<MailOpen className="mr-1 h-3 w-3" />
						Read
					</Badge>
				);
			case "archived":
				return (
					<Badge variant="secondary" className="bg-gray-100 text-gray-800">
						<Archive className="mr-1 h-3 w-3" />
						Archived
					</Badge>
				);
		}
	};

	return (
		<Card
			className={`cursor-pointer transition-colors hover:bg-gray-50 ${message.status === "unread" ? "border-blue-200 bg-blue-50/50" : ""}`}
			onClick={handleCardClick}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
				<div className="flex items-center gap-3">
					<div>
						<h3 className="font-semibold">{message.name}</h3>
						<div className="flex items-center gap-2">
							<button
								onClick={handleEmailClick}
								className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
							>
								{message.email}
								<ExternalLink className="h-3 w-3" />
							</button>
						</div>
					</div>
					{getStatusBadge()}
				</div>
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						{format(new Date(message.createdAt), "MMM dd, yyyy • HH:mm")}
					</span>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0"
								onClick={(e) => e.stopPropagation()}
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{message.status !== "read" && (
								<DropdownMenuItem onClick={() => handleStatusChange("read")}>
									<MailOpen className="mr-2 h-4 w-4" />
									Mark as Read
								</DropdownMenuItem>
							)}
							{message.status !== "unread" && (
								<DropdownMenuItem onClick={() => handleStatusChange("unread")}>
									<Mail className="mr-2 h-4 w-4" />
									Mark as Unread
								</DropdownMenuItem>
							)}
							{message.status !== "archived" && (
								<DropdownMenuItem onClick={() => handleStatusChange("archived")}>
									<Archive className="mr-2 h-4 w-4" />
									Archive
								</DropdownMenuItem>
							)}
							<DropdownMenuItem onClick={handleDeleteClick} className="text-red-600 focus:text-red-600">
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent>
				<p className="whitespace-pre-wrap text-sm line-clamp-3">{message.message}</p>
			</CardContent>

			<DeleteConfirmationDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				onConfirm={handleConfirmDelete}
				title="Delete Message"
				itemName={`the message from ${message.name}`}
				description={`Are you sure you want to delete this message from ${message.name}? This action cannot be undone and the message will be permanently removed.`}
				isLoading={deleteMessageMutation.isPending}
			/>
		</Card>
	);
}