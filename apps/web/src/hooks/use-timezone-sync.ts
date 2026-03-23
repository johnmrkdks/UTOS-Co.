import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/trpc";

/**
 * Auto-sync user timezone on login
 * Silently updates the user's timezone in the background when they log in
 */
export function useTimezoneSync() {
	const { data: session } = authClient.useSession();
	const updateTimezoneMutation = useMutation(
		trpc.auth.updateUserTimezone.mutationOptions(),
	);
	const hasSyncedRef = useRef(false);
	const userIdRef = useRef<string | null>(null);

	useEffect(() => {
		const currentUserId = session?.user?.id;

		// Only run if:
		// 1. User is logged in
		// 2. We haven't synced for this user ID yet
		// 3. Mutation is not currently running
		if (
			currentUserId &&
			userIdRef.current !== currentUserId &&
			!updateTimezoneMutation.isPending
		) {
			const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

			// Mark as synced for this user BEFORE making the request
			userIdRef.current = currentUserId;

			// Update timezone silently in the background
			updateTimezoneMutation.mutate(
				{ timezone: browserTimezone },
				{
					onSuccess: () => {
						console.log(`✅ Timezone synced: ${browserTimezone}`);
					},
					onError: (error) => {
						console.error("❌ Failed to sync timezone:", error);
						// Reset on error so it can retry later
						userIdRef.current = null;
					},
				},
			);
		}

		// Reset when user logs out
		if (!currentUserId) {
			userIdRef.current = null;
		}
	}, [session?.user?.id]); // Only depend on user ID, not the mutation
}
