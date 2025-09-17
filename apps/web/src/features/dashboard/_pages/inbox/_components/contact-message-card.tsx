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
import { Mail, MailOpen, Archive, MoreHorizontal } from "lucide-react";
import type { ContactMessage } from "server/db/sqlite/schema";
import { useUpdateContactMessageStatusMutation } from "../../../_hooks/query/use-update-contact-message-status-mutation";

interface ContactMessageCardProps {
	message: ContactMessage;
}

export function ContactMessageCard({ message }: ContactMessageCardProps) {
	const updateStatusMutation = useUpdateContactMessageStatusMutation();

	const handleStatusChange = (status: "unread" | "read" | "archived") => {
		updateStatusMutation.mutate({
			messageId: message.id,
			status,
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
		<Card className={`${message.status === "unread" ? "border-blue-200 bg-blue-50/50" : ""}`}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
				<div className="flex items-center gap-3">
					<div>
						<h3 className="font-semibold">{message.name}</h3>
						<p className="text-sm text-muted-foreground">{message.email}</p>
					</div>
					{getStatusBadge()}
				</div>
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						{format(new Date(message.createdAt), "MMM dd, yyyy • HH:mm")}
					</span>
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
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent>
				<p className="whitespace-pre-wrap text-sm">{message.message}</p>
			</CardContent>
		</Card>
	);
}