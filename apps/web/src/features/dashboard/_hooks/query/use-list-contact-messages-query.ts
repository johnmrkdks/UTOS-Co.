import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useListContactMessagesQuery = (params?: {
	status?: "unread" | "read" | "archived";
	limit?: number;
	offset?: number;
}) => {
	return useQuery(trpc.contactMessages.list.queryOptions(params || {}));
};