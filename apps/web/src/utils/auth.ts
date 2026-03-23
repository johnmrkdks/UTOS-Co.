import { authClient } from "@/lib/auth-client";
import { redirect } from "@tanstack/react-router";

// Auth guard functions
export async function requireAuth() {
	const session = await authClient.getSession();
	if (!session) {
		throw redirect({
			to: "/sign-in",
			search: {
				redirect: window.location.pathname,
			},
		});
	}
	return session.data;
}

export async function requireAdmin() {
	const session = await requireAuth();
	if (session?.user.role !== "admin" && session?.user.role !== "super_admin") {
		throw redirect({
			to: "/",
		});
	}
	return session;
}

export async function requireSuperAdmin() {
	const session = await requireAuth();
	if (session?.user.role !== "super_admin") {
		throw redirect({
			to: "/admin/dashboard",
		});
	}
	return session;
}

export async function getAuth() {
	const session = await authClient.getSession();
	if (!session) {
		throw redirect({
			to: "/sign-in",
			search: {
				redirect: window.location.pathname,
			},
		});
	}

	return session.data;
}

export async function requireCustomer() {
	const session = await requireAuth();
	if (session?.user.role !== "user") {
		throw redirect({
			to: "/",
		});
	}
	return session;
}

export async function requireDriver() {
	const session = await requireAuth();
	if (session?.user.role !== "driver") {
		throw redirect({
			to: "/",
		});
	}
	return session;
}

export function getDashboardPath(userRole: string | undefined | null): string {
	switch (userRole) {
		case "admin":
		case "super_admin":
			return "/admin/dashboard";
		case "driver":
			return "/driver";
		case "user":
			return "/my-bookings/dashboard";
		default:
			return "/";
	}
}

/**
 * Unified post-login redirect handler for both email/password and OAuth
 * Invalidates session cache, fetches fresh session, and redirects to appropriate dashboard
 */
export async function handlePostLoginRedirect(params: {
	queryClient: any;
	navigate: any;
	redirectPath?: string;
}): Promise<void> {
	const { queryClient, navigate, redirectPath } = params;

	// Invalidate the session query to force refetch
	await queryClient.invalidateQueries({ queryKey: ["auth-session"] });

	// Fetch the updated session to get user role
	const session = await authClient.getSession();
	const userRole = session?.data?.user?.role;

	// Determine redirect path based on role
	const defaultDashboard = getDashboardPath(userRole);
	const finalRedirect = redirectPath || defaultDashboard;

	console.log("🚀 Post-login redirect:", {
		userRole,
		defaultDashboard,
		redirectPath,
		finalRedirect
	});

	// Navigate to the appropriate dashboard
	navigate({
		to: finalRedirect,
	});
}

function parseRedirectUrl(url: string): { to: string; search?: Record<string, string> } {
	if (!url.startsWith("/")) return { to: url };
	const [path, searchStr] = url.split("?");
	if (!searchStr) return { to: path };
	const search: Record<string, string> = {};
	for (const pair of searchStr.split("&")) {
		const [k, v] = pair.split("=");
		if (k && v) search[decodeURIComponent(k)] = decodeURIComponent(v);
	}
	return { to: path, search };
}

export async function redirectIfAuthenticated(options?: {
	redirectUrl?: string;
	queryClient?: { invalidateQueries: (opts: { queryKey: string[] }) => Promise<unknown> };
}) {
	const session = await authClient.getSession();

	// Check if session exists AND has valid data
	if (session?.data?.user) {
		// Invalidate session cache so destination page gets fresh data (prevents redirect loop)
		if (options?.queryClient) {
			await options.queryClient.invalidateQueries({ queryKey: ["auth-session"] });
		}

		const userRole = session.data.user.role;
		const target =
			options?.redirectUrl && options.redirectUrl.startsWith("/")
				? parseRedirectUrl(options.redirectUrl)
				: { to: getDashboardPath(userRole) };

		throw redirect(target);
	}
}

