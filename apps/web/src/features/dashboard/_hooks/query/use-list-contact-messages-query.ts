import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useListContactMessagesQuery = (params?: {
	status?: "unread" | "read" | "archived";
	limit?: number;
	offset?: number;
}) => {
	return useQuery(
		(trpc as any).contactMessages.list.queryOptions(params || {}),
	);
};
