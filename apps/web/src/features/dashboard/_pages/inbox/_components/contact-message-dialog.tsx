import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
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

interface ContactMessageDialogProps {
	message: ContactMessage | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ContactMessageDialog({ message, open, onOpenChange }: ContactMessageDialogProps) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const updateStatusMutation = useUpdateContactMessageStatusMutation();
	const deleteMessageMutation = useDeleteContactMessageMutation();

	if (!message) return null;

	const handleStatusChange = (status: "unread" | "read" | "archived") => {
		updateStatusMutation.mutate({
			messageId: message.id,
			status,
		});
	};

	const handleEmailClick = () => {
		const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(message.email)}&su=${encodeURIComponent(`Re: Contact Form Message from ${message.name}`)}`;
		window.open(gmailUrl, '_blank');
	};

	const handleDeleteClick = () => {
		setShowDeleteDialog(true);
	};

	const handleConfirmDelete = () => {
		deleteMessageMutation.mutate({
			messageId: message.id,
		}, {
			onSuccess: () => {
				setShowDeleteDialog(false);
				onOpenChange(false); // Close dialog after successful deletion
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
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div>
								<DialogTitle className="text-xl">{message.name}</DialogTitle>
								<DialogDescription asChild>
									<div className="flex items-center gap-2 mt-1">
										<button
											onClick={handleEmailClick}
											className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
										>
											{message.email}
											<ExternalLink className="h-3 w-3" />
										</button>
										<span className="text-muted-foreground">•</span>
										<span className="text-sm text-muted-foreground">
											{format(new Date(message.createdAt), "PPpp")}
										</span>
									</div>
								</DialogDescription>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{getStatusBadge()}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
					</div>
				</DialogHeader>

				<div className="mt-6">
					<h4 className="font-semibold mb-3">Message</h4>
					<div className="bg-gray-50 rounded-lg p-4">
						<p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
					</div>
				</div>

				<div className="flex justify-between items-center mt-6 pt-4 border-t">
					<div className="text-sm text-muted-foreground">
						Received {format(new Date(message.createdAt), "PPpp")}
					</div>
					<Button onClick={handleEmailClick} className="flex items-center gap-2">
						<Mail className="h-4 w-4" />
						Reply via Gmail
					</Button>
				</div>
			</DialogContent>
		</Dialog>

		<DeleteConfirmationDialog
			open={showDeleteDialog}
			onOpenChange={setShowDeleteDialog}
			onConfirm={handleConfirmDelete}
			title="Delete Message"
			itemName={`the message from ${message.name}`}
			description={`Are you sure you want to delete this message from ${message.name}? This action cannot be undone and the message will be permanently removed.`}
			isLoading={deleteMessageMutation.isPending}
		/>
		</>
	);
}